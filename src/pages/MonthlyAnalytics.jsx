import { useState, useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, CheckCircle2, Target, Award } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import { useHabitStats, getMonthDates } from '../hooks/useHabitStats';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

export default function MonthlyAnalytics() {
    const { habits, records } = useHabitContext();
    const stats = useHabitStats();
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
    const currentYear = new Date().getFullYear();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const monthDates = useMemo(() => getMonthDates(currentYear, selectedMonth), [currentYear, selectedMonth]);

    // Heatmap data
    const heatmapData = useMemo(() => {
        return monthDates.map((date) => {
            const dayRec = records[date] || {};
            const completed = habits.filter((h) => dayRec[h.id]).length;
            const pct = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
            return { date, completed, total: habits.length, pct };
        });
    }, [monthDates, records, habits]);

    // Category radar data
    const radarData = useMemo(() => {
        const categories = ['Health', 'Mind', 'Work', 'Custom'];
        return categories.map((cat) => {
            const catHabits = habits.filter((h) => h.category === cat);
            if (catHabits.length === 0) return { category: cat, score: 0, fullMark: 100 };
            let total = 0, completed = 0;
            monthDates.forEach((date) => {
                const dayRec = records[date] || {};
                catHabits.forEach((h) => {
                    total++;
                    if (dayRec[h.id]) completed++;
                });
            });
            return { category: cat, score: total > 0 ? Math.round((completed / total) * 100) : 0, fullMark: 100 };
        });
    }, [habits, records, monthDates]);

    // Monthly stats
    const monthStats = useMemo(() => {
        let total = 0, completed = 0, weightedDone = 0, weightedMax = 0;
        monthDates.forEach((date) => {
            const dayRec = records[date] || {};
            habits.forEach((h) => {
                total++;
                weightedMax += (h.difficulty || 3);
                if (dayRec[h.id]) {
                    completed++;
                    weightedDone += (h.difficulty || 3);
                }
            });
        });
        return {
            totalCompletions: completed,
            totalPossible: total,
            weightedScore: weightedMax > 0 ? Math.round((weightedDone / weightedMax) * 100) : 0,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }, [habits, records, monthDates]);

    if (habits.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    title="No monthly data"
                    description="Add habits and start tracking to see your monthly analytics."
                />
            </div>
        );
    }

    const getHeatColor = (pct) => {
        if (pct === 0) return 'bg-bg-primary';
        if (pct <= 25) return 'bg-accent/15';
        if (pct <= 50) return 'bg-accent/30';
        if (pct <= 75) return 'bg-accent/50';
        return 'bg-accent/70';
    };

    const firstDay = new Date(currentYear, selectedMonth, 1).getDay();
    const adjustedFirstDay = (firstDay + 6) % 7; // Monday start

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Monthly Analytics</h1>
                    <p className="text-sm text-text-secondary mt-1">Deep dive into your monthly progress</p>
                </div>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                >
                    {monthNames.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                    ))}
                </select>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Completion Rate" value={`${monthStats.completionRate}%`} icon={Target} color="accent" tooltip="Total completions / total possible" />
                <StatCard title="Total Completions" value={monthStats.totalCompletions} icon={CheckCircle2} color="success" delay={100} />
                <StatCard title="Weighted Score" value={`${monthStats.weightedScore}%`} icon={Award} color="info" tooltip="Score weighted by habit difficulty" delay={200} />
                <StatCard title="Total Possible" value={monthStats.totalPossible} icon={BarChart3} color="warning" delay={300} />
            </div>

            {/* Heatmap + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GitHub-style heatmap */}
                <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-5">{monthNames[selectedMonth]} Heatmap</h3>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-xs text-text-muted font-medium py-1">{day}</div>
                        ))}
                        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {heatmapData.map((day) => (
                            <div
                                key={day.date}
                                className={`aspect-square rounded-lg ${getHeatColor(day.pct)} transition-all hover:scale-110 cursor-default flex items-center justify-center`}
                                title={`${day.date}: ${day.completed}/${day.total} (${day.pct}%)`}
                            >
                                <span className="text-[10px] font-medium text-text-primary/60">
                                    {new Date(day.date + 'T12:00:00').getDate()}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-end gap-1.5 mt-4">
                        <span className="text-xs text-text-muted mr-1">Less</span>
                        <div className="w-4 h-4 rounded bg-bg-primary border border-border/50" />
                        <div className="w-4 h-4 rounded bg-accent/15" />
                        <div className="w-4 h-4 rounded bg-accent/30" />
                        <div className="w-4 h-4 rounded bg-accent/50" />
                        <div className="w-4 h-4 rounded bg-accent/70" />
                        <span className="text-xs text-text-muted ml-1">More</span>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-5">Category Performance</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e8e2db" />
                                <PolarAngleAxis dataKey="category" tick={{ fill: '#7a7580', fontSize: 12, fontWeight: 500 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#7c6f9b"
                                    fill="#7c6f9b"
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white border border-border rounded-xl px-4 py-2 card-shadow">
                                                    <p className="text-sm font-semibold text-text-primary">{payload[0].payload.category}</p>
                                                    <p className="text-xs text-accent">{payload[0].value}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-5">Category Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {radarData.map((cat) => {
                        const colors = {
                            Health: { bg: 'bg-health/8', border: 'border-health/15', text: 'text-health', bar: 'bg-health' },
                            Mind: { bg: 'bg-mind/8', border: 'border-mind/15', text: 'text-mind', bar: 'bg-mind' },
                            Work: { bg: 'bg-warning/8', border: 'border-warning/15', text: 'text-warning', bar: 'bg-warning' },
                            Custom: { bg: 'bg-custom/8', border: 'border-custom/15', text: 'text-custom', bar: 'bg-custom' },
                        };
                        const c = colors[cat.category] || colors.Custom;
                        const catHabitCount = habits.filter((h) => h.category === cat.category).length;
                        return (
                            <div key={cat.category} className={`rounded-xl ${c.bg} border ${c.border} p-4`}>
                                <p className={`text-xs font-medium uppercase tracking-wider ${c.text} mb-2`}>{cat.category}</p>
                                <p className={`text-3xl font-bold ${c.text}`}>{cat.score}%</p>
                                <p className="text-xs text-text-muted mt-1">{catHabitCount} habit{catHabitCount !== 1 ? 's' : ''}</p>
                                <div className="mt-3 h-1.5 rounded-full bg-bg-primary/50 overflow-hidden">
                                    <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${cat.score}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
