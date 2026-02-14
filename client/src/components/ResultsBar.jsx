/**
 * ResultsBar — displays a single poll option with its vote count and
 * a horizontal bar sized proportionally to its share of total votes.
 */
export default function ResultsBar({ text, votes, totalVotes, isSelected }) {
    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

    return (
        <div
            className={`relative rounded-lg overflow-hidden border ${isSelected ? "border-indigo-500 bg-slate-800/80" : "border-slate-700 bg-slate-800/50"
                }`}
        >
            {/* Background bar */}
            <div
                className="absolute inset-0 bg-indigo-600/20 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            />

            {/* Content */}
            <div className="relative flex items-center justify-between px-4 py-3">
                <span className="font-medium text-slate-200">{text}</span>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{votes} vote{votes !== 1 && "s"}</span>
                    <span className="text-sm font-semibold text-indigo-400 min-w-[3ch] text-right">
                        {percentage}%
                    </span>
                </div>
            </div>
        </div>
    );
}
