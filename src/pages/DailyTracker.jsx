import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import { formatDate, getMonthDates } from '../hooks/useHabitStats';
import HabitModal from '../components/HabitModal';
import EmptyState from '../components/EmptyState';

const categoryColors = {
    Health: 'bg-health',
    Mind: 'bg-mind',
    Work: 'bg-warning',
    Custom: 'bg-custom',
};

const categoryTextColors = {
    Health: 'text-health',
    Mind: 'text-mind',
    Work: 'text-warning',
    Custom: 'text-custom',
};

const weekColors = [
    { header: 'bg-week1', light: 'bg-week1-light', text: 'text-week1', border: 'border-week1/30' },
    { header: 'bg-week2', light: 'bg-week2-light', text: 'text-week2', border: 'border-week2/30' },
    { header: 'bg-week3', light: 'bg-week3-light', text: 'text-week3', border: 'border-week3/30' },
    { header: 'bg-week4', light: 'bg-week4-light', text: 'text-week4', border: 'border-week4/30' },
    { header: 'bg-week5', light: 'bg-week5-light', text: 'text-week5', border: 'border-week5/30' },
];

function getWeekIndex(dayNum) {
    if (dayNum <= 7) return 0;
    if (dayNum <= 14) return 1;
    if (dayNum <= 21) return 2;
    if (dayNum <= 28) return 3;
    return 4;
}

export default function DailyTracker() {
    const { habits, records, addHabit, editHabit, deleteHabit, toggleRecord } = useHabitContext();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
    const [selectedYear] = useState(() => new Date().getFullYear());

    const monthDates = useMemo(() => getMonthDates(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
    const today = formatDate(new Date());

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleSave = (habitData) => {
        if (editingHabit) {
            editHabit(editingHabit.id, habitData);
        } else {
            addHabit(habitData);
        }
        setEditingHabit(null);
    };

    const handleEdit = (habit) => {
        setEditingHabit(habit);
        setModalOpen(true);
    };

    const handleDelete = (habit) => {
        if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
            deleteHabit(habit.id);
        }
    };

    // Group dates by week
    const weekGroups = useMemo(() => {
        const groups = [];
        let currentGroup = { weekIndex: 0, dates: [] };

        monthDates.forEach((date) => {
            const dayNum = new Date(date + 'T12:00:00').getDate();
            const wi = getWeekIndex(dayNum);
            if (wi !== currentGroup.weekIndex && currentGroup.dates.length > 0) {
                groups.push(currentGroup);
                currentGroup = { weekIndex: wi, dates: [] };
            }
            currentGroup.weekIndex = wi;
            currentGroup.dates.push(date);
        });
        if (currentGroup.dates.length > 0) groups.push(currentGroup);
        return groups;
    }, [monthDates]);

    // Compute stats per habit for this month
    const habitStats = useMemo(() => {
        return habits.map((h) => {
            const completed = monthDates.filter((d) => (records[d] || {})[h.id]).length;
            const total = monthDates.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const weightedScore = completed * (h.difficulty || 3);
            const maxWeighted = total * (h.difficulty || 3);
            return { ...h, completed, total, pct, weightedScore, maxWeighted };
        });
    }, [habits, records, monthDates]);

    if (habits.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <EmptyState
                    title="No habits yet"
                    description="Create your first habit to start tracking your daily progress."
                    action={() => setModalOpen(true)}
                    actionLabel="Add Habit"
                />
                <HabitModal
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false); setEditingHabit(null); }}
                    onSave={handleSave}
                    habit={editingHabit}
                />
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Daily Tracker</h1>
                    <p className="text-sm text-text-secondary mt-1">Track your daily habits with the checkbox grid</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                    >
                        {monthNames.map((name, i) => (
                            <option key={i} value={i}>{name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => { setEditingHabit(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium text-sm transition-all hover:shadow-md"
                    >
                        <Plus size={16} />
                        Add Habit
                    </button>
                </div>
            </div>

            {/* Checkbox Grid with Week Grouping */}
            <div className="rounded-2xl bg-bg-card border border-border card-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            {/* Week Header Row */}
                            <tr>
                                <th className="sticky left-0 z-20 bg-bg-card px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-secondary min-w-[200px] border-b border-border">
                                    {monthNames[selectedMonth]} {selectedYear}
                                </th>
                                {weekGroups.map((group, gi) => {
                                    const wc = weekColors[group.weekIndex];
                                    return (
                                        <th
                                            key={gi}
                                            colSpan={group.dates.length}
                                            className={`px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-white ${wc.header} border-b border-border`}
                                        >
                                            Week {group.weekIndex + 1}
                                        </th>
                                    );
                                })}
                                <th className="sticky right-0 z-20 bg-bg-card px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-text-secondary min-w-[70px] border-b border-border">
                                    Progress
                                </th>
                            </tr>
                            {/* Day Numbers Row */}
                            <tr className="border-b border-border">
                                <th className="sticky left-0 z-20 bg-bg-card px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-secondary min-w-[200px]">
                                    Habit
                                </th>
                                {monthDates.map((date) => {
                                    const d = new Date(date + 'T12:00:00');
                                    const dayNum = d.getDate();
                                    const dayAbbr = dayAbbrevs[d.getDay()];
                                    const isToday = date === today;
                                    const wi = getWeekIndex(dayNum);
                                    const wc = weekColors[wi];
                                    return (
                                        <th
                                            key={date}
                                            className={`px-0.5 py-1.5 text-center min-w-[34px] ${wc.light}`}
                                        >
                                            <div className={`text-[9px] font-medium text-text-muted mb-0.5`}>{dayAbbr.charAt(0)}</div>
                                            <div className={`text-xs font-medium ${isToday ? 'bg-accent text-white rounded-md px-1 py-0.5' : 'text-text-secondary'}`}>
                                                {dayNum}
                                            </div>
                                        </th>
                                    );
                                })}
                                <th className="sticky right-0 z-20 bg-bg-card px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-text-secondary min-w-[70px]">
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {habitStats.map((habit, idx) => (
                                <tr key={habit.id} className={`border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg-primary/30'}`}>
                                    <td className="sticky left-0 z-10 bg-bg-card px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${categoryColors[habit.category]}`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-text-primary truncate">{habit.name}</p>
                                                    <p className="text-[10px] text-text-muted">{habit.category} · ×{habit.difficulty}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(habit)}
                                                    className="p-1.5 rounded-lg hover:bg-bg-primary transition-colors text-text-muted hover:text-text-secondary"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(habit)}
                                                    className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-text-muted hover:text-danger"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    {monthDates.map((date) => {
                                        const isChecked = (records[date] || {})[habit.id];
                                        const isToday = date === today;
                                        const dayNum = new Date(date + 'T12:00:00').getDate();
                                        const wi = getWeekIndex(dayNum);
                                        const wc = weekColors[wi];
                                        return (
                                            <td key={date} className={`px-0.5 py-1.5 text-center ${wc.light}`}>
                                                <button
                                                    onClick={() => toggleRecord(date, habit.id)}
                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 mx-auto ${isChecked
                                                        ? `${categoryColors[habit.category]} text-white`
                                                        : `bg-white border border-border/80 hover:border-accent/40 ${isToday ? 'ring-1 ring-accent/30' : ''}`
                                                        } ${isChecked ? 'hover:opacity-80' : 'hover:bg-bg-card-hover'}`}
                                                >
                                                    {isChecked && <Check size={12} strokeWidth={3} />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                    <td className="sticky right-0 z-10 bg-bg-card px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 rounded-full bg-bg-primary overflow-hidden min-w-[40px]">
                                                <div
                                                    className={`h-full rounded-full ${categoryColors[habit.category]} transition-all duration-700`}
                                                    style={{ width: `${habit.pct}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold ${categoryTextColors[habit.category]} min-w-[30px] text-right`}>{habit.pct}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {habitStats.map((habit) => (
                    <div key={habit.id} className="rounded-xl bg-bg-card border border-border p-4 animate-in card-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[habit.category]}`} />
                            <p className="text-xs font-medium text-text-primary truncate">{habit.name}</p>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className={`text-2xl font-bold ${categoryTextColors[habit.category]}`}>{habit.pct}%</p>
                                <p className="text-xs text-text-muted mt-0.5">completion</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-text-secondary">{habit.weightedScore}</p>
                                <p className="text-xs text-text-muted">weighted</p>
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full bg-bg-primary overflow-hidden">
                            <div
                                className={`h-full rounded-full ${categoryColors[habit.category]} transition-all duration-700`}
                                style={{ width: `${habit.pct}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <HabitModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingHabit(null); }}
                onSave={handleSave}
                habit={editingHabit}
            />
        </div>
    );
}
