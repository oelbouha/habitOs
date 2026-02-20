import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckCircle2,
    CalendarDays,
    BarChart3,
    TrendingUp,
    Download,
    Upload,
    FileSpreadsheet,
    FileText,
    Sun,
    Moon,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import { useExport } from '../hooks/useExport';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tracker', label: 'Daily Tracker', icon: CheckCircle2 },
    { path: '/weekly', label: 'Weekly', icon: CalendarDays },
    { path: '/monthly', label: 'Monthly', icon: BarChart3 },
    { path: '/yearly', label: 'Year Overview', icon: TrendingUp },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const { settings, updateSettings } = useHabitContext();
    const { exportToExcel, exportToCSV, exportBackup, restoreBackup } = useExport();
    const location = useLocation();

    const toggleTheme = () => {
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
    };

    const handleRestore = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await restoreBackup(file);
                alert('Backup restored successfully!');
            } catch (err) {
                alert('Failed to restore: ' + err.message);
            }
        }
        e.target.value = '';
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-sidebar border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                            <span className="text-white font-bold text-sm">H</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-text-primary leading-tight">HabitOS</h1>
                            <p className="text-[10px] text-text-muted font-medium tracking-wider uppercase">Yearly Habit System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-accent/10 text-accent border border-accent/20'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border border-transparent'
                                }`
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}

                    {/* Export section */}
                    <div className="pt-4 mt-4 border-t border-border">
                        <button
                            onClick={() => setExportOpen(!exportOpen)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all"
                        >
                            <span className="flex items-center gap-3">
                                <Download size={18} />
                                Export & Backup
                            </span>
                            <ChevronDown size={14} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {exportOpen && (
                            <div className="ml-4 mt-1 space-y-1 animate-in">
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all"
                                >
                                    <FileSpreadsheet size={16} />
                                    Export Excel
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all"
                                >
                                    <FileText size={16} />
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all"
                                >
                                    <FileText size={16} />
                                    Print Report
                                </button>
                                <button
                                    onClick={exportBackup}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all"
                                >
                                    <Download size={16} />
                                    Backup JSON
                                </button>
                                <label className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all cursor-pointer">
                                    <Upload size={16} />
                                    Restore Backup
                                    <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all"
                    >
                        {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <p className="text-[10px] text-text-muted text-center">HabitOS v1.0.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-bg-secondary/90 backdrop-blur-xl sticky top-0 z-30 no-print">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors text-text-secondary"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                            <span className="text-white font-bold text-xs">H</span>
                        </div>
                        <span className="font-semibold text-sm text-text-primary">HabitOS</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors text-text-secondary"
                    >
                        {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
