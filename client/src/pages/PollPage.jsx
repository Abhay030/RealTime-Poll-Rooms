import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import socket from "../lib/socket";
import ResultsBar from "../components/ResultsBar";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Retrieves or generates a unique browser token for anti-abuse.
 *
 * LIMITATION: This token is stored in localStorage and can be cleared by the
 * user. Using incognito mode also generates a new token. This mechanism alone
 * is not sufficient to prevent determined abuse — it works best in combination
 * with IP-based checking on the server side.
 */
function getVoterToken() {
    const STORAGE_KEY = "poll_voter_token";
    let token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
        token = uuidv4();
        localStorage.setItem(STORAGE_KEY, token);
    }
    return token;
}

export default function PollPage() {
    const { id: pollId } = useParams();

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteError, setVoteError] = useState("");
    const [voting, setVoting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Check if user has already voted (stored in localStorage per poll)
    const checkIfVoted = useCallback(() => {
        const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "{}");
        return !!votedPolls[pollId];
    }, [pollId]);

    const markAsVoted = useCallback(
        (optionIndex) => {
            const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "{}");
            votedPolls[pollId] = optionIndex;
            localStorage.setItem("voted_polls", JSON.stringify(votedPolls));
        },
        [pollId]
    );

    // Fetch poll data
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch(`${API_URL}/api/polls/${pollId}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Failed to load poll");
                    return;
                }

                setPoll(data.poll);
                if (checkIfVoted()) {
                    setHasVoted(true);
                }
            } catch {
                setError("Network error. Could not load poll.");
            } finally {
                setLoading(false);
            }
        };

        fetchPoll();
    }, [pollId, checkIfVoted]);

    // Socket.io — join room and listen for real-time updates
    useEffect(() => {
        socket.connect();
        socket.emit("joinPoll", pollId);

        const handleUpdate = (data) => {
            setPoll(data.poll);
        };

        socket.on("voteUpdate", handleUpdate);

        return () => {
            socket.off("voteUpdate", handleUpdate);
            socket.disconnect();
        };
    }, [pollId]);

    // Cast vote
    const handleVote = async () => {
        if (selectedOption === null || hasVoted || voting) return;

        setVoting(true);
        setVoteError("");

        try {
            const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    optionIndex: selectedOption,
                    voterToken: getVoterToken(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setVoteError(data.error || "Failed to cast vote");
                // If the server says we already voted, mark it locally too
                if (res.status === 403) {
                    setHasVoted(true);
                    markAsVoted(selectedOption);
                }
                return;
            }

            setPoll(data.poll);
            setHasVoted(true);
            markAsVoted(selectedOption);
        } catch {
            setVoteError("Network error. Please try again.");
        } finally {
            setVoting(false);
        }
    };

    // Copy shareable link
    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Total votes across all options
    const totalVotes = poll ? poll.options.reduce((sum, opt) => sum + opt.votes, 0) : 0;

    // ── Render States ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto text-center py-20">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-xl font-semibold text-white mb-2">Oops!</h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                >
                    Create a new poll
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Question */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">{poll.question}</h1>
                <p className="text-sm text-slate-500">
                    {totalVotes} total vote{totalVotes !== 1 && "s"}
                    {hasVoted && (
                        <span className="ml-2 text-green-400">✓ You voted</span>
                    )}
                </p>
            </div>

            {/* Options / Results */}
            <div className="space-y-3 mb-6">
                {poll.options.map((option, index) => {
                    if (hasVoted) {
                        // Show results view
                        const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "{}");
                        return (
                            <ResultsBar
                                key={index}
                                text={option.text}
                                votes={option.votes}
                                totalVotes={totalVotes}
                                isSelected={votedPolls[pollId] === index}
                            />
                        );
                    }

                    // Show voting view
                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedOption(index)}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${selectedOption === index
                                    ? "border-indigo-500 bg-indigo-600/20 text-white"
                                    : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === index ? "border-indigo-500" : "border-slate-600"
                                        }`}
                                >
                                    {selectedOption === index && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    )}
                                </div>
                                <span className="font-medium">{option.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Vote Button */}
            {!hasVoted && (
                <button
                    onClick={handleVote}
                    disabled={selectedOption === null || voting}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                    {voting ? "Voting…" : "Vote"}
                </button>
            )}

            {/* Vote Error */}
            {voteError && (
                <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {voteError}
                </div>
            )}

            {/* Share Link */}
            <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-3">Share this poll</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        readOnly
                        value={window.location.href}
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm"
                    />
                    <button
                        onClick={copyLink}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
}
