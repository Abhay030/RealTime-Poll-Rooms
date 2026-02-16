const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const { getIO } = require("../config/socket");

//   POST /api/polls
//   Create a new poll with a question and at least 2 options.---

const createPoll = async (req, res, next) => {
    try {
        const { question, options } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ error: "Question is required" });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ error: "At least 2 options are required" });
        }

        const validOptions = options
            .map((opt) => (typeof opt === "string" ? opt.trim() : ""))
            .filter((opt) => opt.length > 0);

        if (validOptions.length < 2) {
            return res.status(400).json({ error: "At least 2 non-empty options are required" });
        }

        const poll = await Poll.create({
            question: question.trim(),
            options: validOptions.map((text) => ({ text, votes: 0 })),
        });

        res.status(201).json({ pollId: poll._id, poll });
    } catch (err) {
        next(err);
    }
};

//   GET /api/polls/:id
const getPoll = async (req, res, next) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ error: "Poll not found" });
        }

        res.json({ poll });
    } catch (err) {
        next(err);
    }
};


// Anti-abuse mechanisms:
// 1. IP-based prevention: The voter's IP address is recorded. If the same IP
//    has already voted on this poll, the vote is rejected.
//    LIMITATION: Users behind the same NAT/proxy share an IP, so legitimate
//    users on the same network may be blocked. IPs can also be spoofed or
//    changed using VPNs.
// 2. Browser token prevention: A UUID is generated client-side and stored in
//    localStorage. This token is sent with each vote request. If the same
//    token has already voted, the vote is rejected.
//    LIMITATION: Clearing localStorage or using incognito mode generates a
//    new token, allowing the same user to vote again. This is not a
//    substitute for proper user authentication.
// Together these mechanisms provide reasonable protection for a public,
// unauthenticated poll system without requiring user sign-up.

const votePoll = async (req, res, next) => {
    try {
        const { optionIndex, voterToken } = req.body;
        const pollId = req.params.id;

        // Validate inputs
        if (optionIndex === undefined || optionIndex === null) {
            return res.status(400).json({ error: "Option index is required" });
        }

        if (!voterToken) {
            return res.status(400).json({ error: "Voter token is required" });
        }

        // Find the poll
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ error: "Poll not found" });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ error: "Invalid option index" });
        }

        // Get voter IP from request
        const voterIP =
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            "unknown";

        // Check for existing vote by IP
        const existingIPVote = await Vote.findOne({ pollId, voterIP });
        if (existingIPVote) {
            return res.status(403).json({ error: "You have already voted on this poll (IP detected)" });
        }

        // Check for existing vote by browser token
        const existingTokenVote = await Vote.findOne({ pollId, voterToken });
        if (existingTokenVote) {
            return res
                .status(403)
                .json({ error: "You have already voted on this poll (browser detected)" });
        }

        await Vote.create({ pollId, voterIP, voterToken, optionIndex });

        const updatedPoll = await Poll.findOneAndUpdate(
            { _id: pollId },
            { $inc: { [`options.${optionIndex}.votes`]: 1 } },
            { new: true }
        );

        // Emit real-time update to all clients viewing this poll
        const io = getIO();
        io.to(pollId).emit("voteUpdate", { poll: updatedPoll });

        res.json({ poll: updatedPoll });
    } catch (err) {
        next(err);
    }
};

module.exports = { createPoll, getPoll, votePoll };
