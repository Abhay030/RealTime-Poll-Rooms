import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function CreatePollPage() {
    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const addOption = () => {
        if (options.length >= 10) return;
        setOptions([...options, ""]);
    };

    const removeOption = (index) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const trimmedQuestion = question.trim();
        const validOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);

        if (!trimmedQuestion) {
            setError("Please enter a question");
            return;
        }

        if (validOptions.length < 2) {
            setError("Please provide at least 2 non-empty options");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/polls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: trimmedQuestion, options: validOptions }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create poll");
                return;
            }

            navigate(`/poll/${data.pollId}`);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create a Poll</h1>
                <p className="text-slate-400">Ask a question and share the link to collect votes in real-time.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question */}
                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-slate-300 mb-2">
                        Question
                    </label>
                    <input
                        id="question"
                        type="text"
                        placeholder="What would you like to ask?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                {/* Options */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Options</label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    maxLength={200}
                                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="p-3 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                                        title="Remove option"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {options.length < 10 && (
                        <button
                            type="button"
                            onClick={addOption}
                            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            + Add option
                        </button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                    {submitting ? "Creating…" : "Create Poll"}
                </button>
            </form>
        </div>
    );
}
