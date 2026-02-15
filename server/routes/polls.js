const express = require("express");
const { createPoll, getPoll, votePoll } = require("../controllers/pollController");

const router = express.Router();

// POST /api/polls — Create a new poll
router.post("/", createPoll);

// GET /api/polls/:id — Get poll by ID
router.get("/:id", getPoll);

// POST /api/polls/:id/vote — Vote on a poll
router.post("/:id/vote", votePoll);

module.exports = router;
