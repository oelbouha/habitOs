import { useEffect, useState } from 'react';

export default function ProgressRing({ percentage = 0, size = 140, strokeWidth = 10, color = '#7c6f9b' }) {
    const [animatedPercent, setAnimatedPercent] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedPercent / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedPercent(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    const getColor = () => {
        if (percentage >= 80) return '#7ab8a0';
        if (percentage >= 50) return '#7c6f9b';
        if (percentage >= 25) return '#e8c170';
        return '#d98a8a';
    };

    const activeColor = color === 'auto' ? getColor() : color;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-border/40"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={activeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 4px ${activeColor}30)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-text-primary tabular-nums">
                    {Math.round(animatedPercent)}%
                </span>
                <span className="text-xs text-text-secondary mt-0.5">completed</span>
            </div>
        </div>
    );
}
