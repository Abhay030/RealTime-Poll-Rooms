const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true,
    maxlength: [500, "Question cannot exceed 500 characters"],
  },
  options: [
    {
      text: {
        type: String,
        required: [true, "Option text is required"],
        trim: true,
        maxlength: [200, "Option text cannot exceed 200 characters"],
      },
      votes: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate that poll has at least 2 options
pollSchema.pre("validate", function (next) {
  if (!this.options || this.options.length < 2) {
    this.invalidate("options", "Poll must have at least 2 options");
  }
  next();
});


module.exports = mongoose.model("Poll", pollSchema);
