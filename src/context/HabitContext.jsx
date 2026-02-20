import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const HabitContext = createContext(null);

const DEFAULT_SETTINGS = {
    theme: 'light',
    startDay: 'monday',
};

const generateId = () => `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function loadFromStorage(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

export function HabitProvider({ children }) {
    const [habits, setHabits] = useState(() => loadFromStorage('habitos_habits', []));
    const [records, setRecords] = useState(() => loadFromStorage('habitos_records', {}));
    const [settings, setSettings] = useState(() => loadFromStorage('habitos_settings', DEFAULT_SETTINGS));
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) saveToStorage('habitos_habits', habits);
    }, [habits, isLoaded]);

    useEffect(() => {
        if (isLoaded) saveToStorage('habitos_records', records);
    }, [records, isLoaded]);

    useEffect(() => {
        if (isLoaded) saveToStorage('habitos_settings', settings);
    }, [settings, isLoaded]);

    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [settings.theme]);

    const addHabit = useCallback((habit) => {
        const newHabit = {
            id: generateId(),
            name: habit.name,
            category: habit.category || 'Custom',
            difficulty: habit.difficulty || 3,
            createdAt: new Date().toISOString(),
        };
        setHabits((prev) => [...prev, newHabit]);
        return newHabit;
    }, []);

    const editHabit = useCallback((id, updates) => {
        setHabits((prev) =>
            prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
        );
    }, []);

    const deleteHabit = useCallback((id) => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        setRecords((prev) => {
            const newRecords = { ...prev };
            Object.keys(newRecords).forEach((date) => {
                if (newRecords[date][id] !== undefined) {
                    const { [id]: _, ...rest } = newRecords[date];
                    newRecords[date] = rest;
                }
            });
            return newRecords;
        });
    }, []);

    const toggleRecord = useCallback((date, habitId) => {
        setRecords((prev) => {
            const dayRecords = prev[date] || {};
            return {
                ...prev,
                [date]: {
                    ...dayRecords,
                    [habitId]: !dayRecords[habitId],
                },
            };
        });
    }, []);

    const updateSettings = useCallback((updates) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    }, []);

    const importData = useCallback((data) => {
        if (data.habits) setHabits(data.habits);
        if (data.records) setRecords(data.records);
        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }, []);

    const exportData = useCallback(() => {
        return { habits, records, settings };
    }, [habits, records, settings]);

    const value = {
        habits,
        records,
        settings,
        isLoaded,
        addHabit,
        editHabit,
        deleteHabit,
        toggleRecord,
        updateSettings,
        importData,
        exportData,
    };

    return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabitContext() {
    const context = useContext(HabitContext);
    if (!context) {
        throw new Error('useHabitContext must be used within a HabitProvider');
    }
    return context;
}
