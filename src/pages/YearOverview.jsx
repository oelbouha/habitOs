import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Flame, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import { useHabitStats } from '../hooks/useHabitStats';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-border rounded-xl px-4 py-3 card-shadow">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-accent mt-1">
                    {payload[0].value}% consistency
                </p>
                <p className="text-xs text-text-secondary">
                    {payload[0].payload.completed} / {payload[0].payload.total} completions
                </p>
            </div>
        );
    }
    return null;
};

export default function YearOverview() {
    const { habits } = useHabitContext();
    const stats = useHabitStats();

    if (habits.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    title="No yearly data"
                    description="Add habits and start tracking to see your year overview."
                />
            </div>
        );
    }

    const currentYear = new Date().getFullYear();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{currentYear} Overview</h1>
                <p className="text-sm text-text-secondary mt-1">Your full year habit performance at a glance</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Annual Score"
                    value={`${stats.annualScore}%`}
                    subtitle="Weighted by difficulty"
                    icon={Trophy}
                    color={stats.annualScore >= 70 ? 'success' : stats.annualScore >= 40 ? 'accent' : 'warning'}
                    tooltip="Overall weighted completion for the entire year"
                />
                <StatCard
                    title="Total Completed"
                    value={stats.totalCompletedYear.toLocaleString()}
                    subtitle="Individual check-ins"
                    icon={CheckCircle2}
                    color="info"
                    delay={100}
                />
                <StatCard
                    title="Longest Streak"
                    value={`${stats.yearLongestStreak} days`}
                    subtitle="This year's best"
                    icon={Flame}
                    color="danger"
                    delay={200}
                />
                <StatCard
                    title="Most Consistent"
                    value={stats.mostConsistentHabit?.name || '—'}
                    subtitle={stats.mostConsistentHabit ? `${stats.mostConsistentHabit.yearPercentage}% completion` : ''}
                    icon={Star}
                    color="accent"
                    delay={300}
                />
            </div>

            {/* 12-Month Chart */}
            <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-6">Monthly Consistency</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.yearlyData}>
                            <defs>
                                <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c6f9b" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#7c6f9b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#7a7580', fontSize: 12, fontWeight: 500 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#7a7580', fontSize: 12 }}
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                stroke="#7c6f9b"
                                strokeWidth={3}
                                fill="url(#colorConsistency)"
                                dot={{ fill: '#7c6f9b', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
                                activeDot={{ r: 6, stroke: '#7c6f9b', strokeWidth: 2, fill: '#a597c4' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Month Cards Grid */}
            <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-5">Month-by-Month Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {stats.yearlyData.map((month) => {
                        const isActive = month.monthIndex <= new Date().getMonth();
                        const getColor = () => {
                            if (!isActive) return 'bg-bg-primary/50 border-border/50 opacity-50';
                            if (month.percentage >= 80) return 'bg-success/8 border-success/20';
                            if (month.percentage >= 50) return 'bg-accent/8 border-accent/20';
                            if (month.percentage >= 20) return 'bg-warning/8 border-warning/20';
                            return 'bg-danger/8 border-danger/20';
                        };
                        const getTextColor = () => {
                            if (!isActive) return 'text-text-muted';
                            if (month.percentage >= 80) return 'text-success';
                            if (month.percentage >= 50) return 'text-accent';
                            if (month.percentage >= 20) return 'text-warning';
                            return 'text-danger';
                        };
                        return (
                            <div key={month.month} className={`rounded-xl border p-4 text-center ${getColor()}`}>
                                <p className="text-xs font-medium text-text-secondary mb-1">{month.month}</p>
                                <p className={`text-2xl font-bold ${getTextColor()}`}>{month.percentage}%</p>
                                <p className="text-[10px] text-text-muted mt-1">{month.completed} done</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Habit Performance Table */}
            <div className="rounded-2xl bg-bg-card border border-border overflow-hidden card-shadow animate-in">
                <div className="p-6 border-b border-border">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Habit Performance Rankings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Habit</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-muted">Category</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-muted">Difficulty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Completion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habits
                                .map((h) => {
                                    const yearDatesCount = stats.yearlyData.reduce((sum, m) => sum + m.total, 0) / habits.length;
                                    const completed = stats.yearlyData.reduce((sum, m) => {
                                        return sum;
                                    }, 0);
                                    return h;
                                })
                                .map((h, i) => {
                                    const catColor = {
                                        Health: 'bg-health/12 text-health',
                                        Mind: 'bg-mind/12 text-mind',
                                        Work: 'bg-warning/12 text-warning',
                                        Custom: 'bg-custom/12 text-custom',
                                    };
                                    return (
                                        <tr key={h.id} className={`border-b border-border/30 ${i % 2 === 0 ? '' : 'bg-bg-primary/20'}`}>
                                            <td className="px-6 py-4 text-sm text-text-muted">{i + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-text-primary">{h.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${catColor[h.category] || catColor.Custom}`}>
                                                    {h.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-text-secondary">{'★'.repeat(h.difficulty)}{'☆'.repeat(5 - h.difficulty)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-semibold text-accent">
                                                    {stats.mostConsistentHabit?.id === h.id ? `${stats.mostConsistentHabit.yearPercentage}%` : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
