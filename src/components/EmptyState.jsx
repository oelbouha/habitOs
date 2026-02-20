import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title = 'No data yet', description = 'Start by adding your first habit to begin tracking.', icon: Icon = ClipboardList, action, actionLabel }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Icon size={36} className="text-accent" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
            {action && (
                <button
                    onClick={action}
                    className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium text-sm transition-all hover:shadow-md"
                >
                    {actionLabel || 'Get Started'}
                </button>
            )}
        </div>
    );
}
