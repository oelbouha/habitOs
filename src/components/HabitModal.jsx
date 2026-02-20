import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Health', 'Mind', 'Work', 'Custom'];

export default function HabitModal({ isOpen, onClose, onSave, habit = null }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Health');
    const [difficulty, setDifficulty] = useState(3);

    useEffect(() => {
        if (habit) {
            setName(habit.name);
            setCategory(habit.category);
            setDifficulty(habit.difficulty);
        } else {
            setName('');
            setCategory('Health');
            setDifficulty(3);
        }
    }, [habit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), category, difficulty });
        onClose();
    };

    const categoryColors = {
        Health: 'bg-health/15 text-health border-health/30',
        Mind: 'bg-mind/15 text-mind border-mind/30',
        Work: 'bg-warning/15 text-warning border-warning/30',
        Custom: 'bg-custom/15 text-custom border-custom/30',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-bg-secondary border border-border rounded-2xl card-shadow animate-in overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">
                        {habit ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors text-text-secondary"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Habit Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Morning meditation"
                            className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${category === cat
                                            ? categoryColors[cat]
                                            : 'bg-bg-primary border-border text-text-secondary hover:border-border-light'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Difficulty <span className="text-text-muted">({difficulty}/5)</span>
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDifficulty(d)}
                                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${d <= difficulty
                                            ? 'bg-accent/15 border-accent/30 text-accent'
                                            : 'bg-bg-primary border-border text-text-muted hover:border-border-light'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-text-secondary hover:bg-bg-card-hover transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium transition-all hover:shadow-md"
                        >
                            {habit ? 'Update' : 'Add Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
