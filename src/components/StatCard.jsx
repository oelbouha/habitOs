import { Tooltip } from './Tooltip';

const colorMap = {
    accent: 'from-accent/10 to-accent/5 border-accent/20',
    success: 'from-success/10 to-success/5 border-success/20',
    warning: 'from-warning/10 to-warning/5 border-warning/20',
    danger: 'from-danger/10 to-danger/5 border-danger/20',
    info: 'from-info/10 to-info/5 border-info/20',
};

const iconColorMap = {
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'accent', tooltip, delay = 0 }) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[color]} border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-in`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{title}</p>
                        {tooltip && <Tooltip text={tooltip} />}
                    </div>
                    <p className="text-3xl font-bold text-text-primary mt-1 tabular-nums">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-text-secondary mt-1.5">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl bg-white/60 ${iconColorMap[color]}`}>
                        <Icon size={22} strokeWidth={2} />
                    </div>
                )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-black/[0.02]" />
        </div>
    );
}
