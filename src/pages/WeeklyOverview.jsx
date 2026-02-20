import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import { useHabitStats } from '../hooks/useHabitStats';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-border rounded-xl px-4 py-3 card-shadow">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary mt-1">
                    {payload[0].value}% completed ({payload[0].payload.completed}/{payload[0].payload.total})
                </p>
            </div>
        );
    }
    return null;
};

export default function WeeklyOverview() {
    const { habits } = useHabitContext();
    const stats = useHabitStats();

    if (habits.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    title="No weekly data"
                    description="Add habits and start tracking to see your weekly overview."
                />
            </div>
        );
    }

    const getBarColor = (pct) => {
        if (pct >= 80) return '#7ab8a0';
        if (pct >= 60) return '#7c6f9b';
        if (pct >= 40) return '#a597c4';
        if (pct >= 20) return '#e8c170';
        return '#d98a8a';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Weekly Overview</h1>
                <p className="text-sm text-text-secondary mt-1">Your 7-day habit performance summary</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Weekly Score"
                    value={`${stats.weeklyConsistency}%`}
                    subtitle="7-day consistency"
                    icon={Calendar}
                    color={stats.weeklyConsistency >= 80 ? 'success' : 'accent'}
                    tooltip="Percentage of all habit checks completed this week"
                />
                {stats.bestHabitWeek && (
                    <StatCard
                        title="Best Habit"
                        value={stats.bestHabitWeek.name}
                        subtitle={`${stats.bestHabitWeek.weekPercentage}% this week`}
                        icon={TrendingUp}
                        color="success"
                        delay={100}
                    />
                )}
                {stats.worstHabitWeek && (
                    <StatCard
                        title="Needs Work"
                        value={stats.worstHabitWeek.name}
                        subtitle={`${stats.worstHabitWeek.weekPercentage}% this week`}
                        icon={TrendingDown}
                        color="danger"
                        delay={200}
                    />
                )}
            </div>

            {/* Bar Chart */}
            <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-6">Daily Completion Rate</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.weeklyData} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" vertical={false} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#7a7580', fontSize: 13, fontWeight: 500 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#7a7580', fontSize: 12 }}
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={50}>
                                {stats.weeklyData.map((entry, i) => (
                                    <Cell key={i} fill={getBarColor(entry.percentage)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="rounded-2xl bg-bg-card border border-border overflow-hidden card-shadow animate-in">
                <div className="p-6 border-b border-border">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Day-by-Day Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Day</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-muted">Completed</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-muted">Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.weeklyData.map((day, i) => (
                                <tr key={day.date} className={`border-b border-border/30 ${i % 2 === 0 ? '' : 'bg-bg-primary/30'}`}>
                                    <td className="px-6 py-4 text-sm font-medium text-text-primary">{day.day}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{day.date}</td>
                                    <td className="px-6 py-4 text-center text-sm font-semibold text-text-primary">{day.completed}</td>
                                    <td className="px-6 py-4 text-center text-sm text-text-secondary">{day.total}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${day.percentage >= 80
                                                ? 'bg-success/12 text-success'
                                                : day.percentage >= 50
                                                    ? 'bg-accent/12 text-accent'
                                                    : day.percentage > 0
                                                        ? 'bg-warning/12 text-warning'
                                                        : 'bg-danger/12 text-danger'
                                                }`}
                                        >
                                            {day.percentage}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
