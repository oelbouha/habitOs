import { useEffect, useRef } from 'react';
import { Flame, Trophy, Target, Zap, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import { useHabitStats } from '../hooks/useHabitStats';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import EmptyState from '../components/EmptyState';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { habits } = useHabitContext();
    const stats = useHabitStats();
    const navigate = useNavigate();
    const confettiFired = useRef(false);

    useEffect(() => {
        if (stats.weeklyConsistency >= 100 && habits.length > 0 && !confettiFired.current) {
            confettiFired.current = true;
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#7c6f9b', '#a597c4', '#7ab8a0', '#e8c170', '#d4849a'],
            });
        }
    }, [stats.weeklyConsistency, habits.length]);

    if (habits.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    title="Welcome to HabitOS"
                    description="Build lasting habits with powerful analytics, streaks, and export tools. Add your first habit to get started."
                    icon={Target}
                    action={() => navigate('/tracker')}
                    actionLabel="Add Your First Habit"
                />
            </div>
        );
    }

    const moodColors = {
        neutral: 'text-text-secondary',
        low: 'text-warning',
        building: 'text-info',
        good: 'text-accent-light',
        great: 'text-success',
        perfect: 'text-success',
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className={`text-sm font-medium ${moodColors[stats.motivationalMessage.mood]}`}>
                    {stats.motivationalMessage.text}
                </div>
            </div>

            {/* Progress Ring + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Ring Card */}
                <div className="lg:row-span-2 rounded-2xl bg-bg-card border border-border p-8 flex flex-col items-center justify-center card-shadow animate-in">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-6">Today&apos;s Progress</p>
                    <ProgressRing percentage={stats.todayCompletion} size={180} strokeWidth={12} color="auto" />
                    <p className="text-sm text-text-secondary mt-6">
                        <span className="text-text-primary font-semibold">{stats.todayCompleted}</span> of{' '}
                        <span className="text-text-primary font-semibold">{stats.todayTotal}</span> habits completed
                    </p>
                </div>

                {/* Stats Grid */}
                <StatCard
                    title="Weekly Consistency"
                    value={`${stats.weeklyConsistency}%`}
                    subtitle="7-day average"
                    icon={Calendar}
                    color={stats.weeklyConsistency >= 80 ? 'success' : stats.weeklyConsistency >= 50 ? 'accent' : 'warning'}
                    tooltip="Average completion rate for the current week"
                    delay={100}
                />
                <StatCard
                    title="Monthly Score"
                    value={`${stats.monthlyScore}%`}
                    subtitle="Weighted by difficulty"
                    icon={BarChart3}
                    color={stats.monthlyScore >= 80 ? 'success' : stats.monthlyScore >= 50 ? 'accent' : 'warning'}
                    tooltip="Weighted completion score for this month"
                    delay={200}
                />
                <StatCard
                    title="Current Streak"
                    value={`${stats.currentStreak} days`}
                    subtitle={stats.currentStreak > 0 ? "Keep it going!" : "Start today!"}
                    icon={Flame}
                    color={stats.currentStreak >= 7 ? 'danger' : 'warning'}
                    tooltip="Consecutive days with 100% completion"
                    delay={300}
                />
                <StatCard
                    title="Longest Streak"
                    value={`${stats.longestStreak} days`}
                    subtitle="Personal best"
                    icon={Trophy}
                    color="info"
                    tooltip="Your all-time longest consecutive streak"
                    delay={400}
                />
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Performance */}
                <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in" style={{ animationDelay: '500ms' }}>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-5">Category Performance</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.categoryPerformance).map(([cat, pct]) => {
                            const colors = {
                                Health: { bar: 'bg-health', text: 'text-health' },
                                Mind: { bar: 'bg-mind', text: 'text-mind' },
                                Work: { bar: 'bg-warning', text: 'text-warning' },
                                Custom: { bar: 'bg-custom', text: 'text-custom' },
                            };
                            const c = colors[cat] || colors.Custom;
                            return (
                                <div key={cat}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium text-text-primary">{cat}</span>
                                        <span className={`text-sm font-semibold ${c.text}`}>{pct}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${c.bar} transition-all duration-1000 ease-out`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Habit Highlights */}
                <div className="rounded-2xl bg-bg-card border border-border p-6 card-shadow animate-in" style={{ animationDelay: '600ms' }}>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-text-secondary mb-5">This Week&apos;s Highlights</h3>
                    <div className="space-y-4">
                        {stats.bestHabitWeek && (
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-success/8 border border-success/15">
                                <div className="p-2 rounded-lg bg-success/15">
                                    <TrendingUp size={18} className="text-success" />
                                </div>
                                <div>
                                    <p className="text-xs text-success font-medium uppercase tracking-wider">Best Habit</p>
                                    <p className="text-sm font-semibold text-text-primary">{stats.bestHabitWeek.name}</p>
                                    <p className="text-xs text-text-secondary">{stats.bestHabitWeek.weekPercentage}% this week</p>
                                </div>
                            </div>
                        )}
                        {stats.worstHabitWeek && stats.worstHabitWeek.id !== stats.bestHabitWeek?.id && (
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-danger/8 border border-danger/15">
                                <div className="p-2 rounded-lg bg-danger/15">
                                    <Zap size={18} className="text-danger" />
                                </div>
                                <div>
                                    <p className="text-xs text-danger font-medium uppercase tracking-wider">Needs Attention</p>
                                    <p className="text-sm font-semibold text-text-primary">{stats.worstHabitWeek.name}</p>
                                    <p className="text-xs text-text-secondary">{stats.worstHabitWeek.weekPercentage}% this week</p>
                                </div>
                            </div>
                        )}
                        {stats.currentStreak > 0 && (
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/8 border border-accent/15">
                                <div className="p-2 rounded-lg bg-accent/15">
                                    <Flame size={18} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-accent font-medium uppercase tracking-wider">Active Streak</p>
                                    <p className="text-sm font-semibold text-text-primary">{stats.currentStreak} day streak!</p>
                                    <p className="text-xs text-text-secondary">Personal best: {stats.longestStreak} days</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
