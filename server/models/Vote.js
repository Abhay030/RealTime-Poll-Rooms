const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true,
        index: true,
    },
    voterIP: {
        type: String,
        required: true,
    },
    voterToken: {
        type: String,
        required: true,
    },
    optionIndex: {
        type: Number,
        required: true,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound indexes for fast duplicate vote lookups
voteSchema.index({ pollId: 1, voterIP: 1 }, { unique: true });
voteSchema.index({ pollId: 1, voterToken: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
