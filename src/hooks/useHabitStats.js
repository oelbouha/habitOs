import { useMemo } from 'react';
import { useHabitContext } from '../context/HabitContext';

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getWeekDates(date, startDay = 'monday') {
    const d = new Date(date);
    const day = d.getDay();
    const startOffset = startDay === 'monday' ? ((day + 6) % 7) : day;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - startOffset);

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const wd = new Date(weekStart);
        wd.setDate(weekStart.getDate() + i);
        dates.push(formatDate(wd));
    }
    return dates;
}

function getMonthDates(year, month) {
    const dates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        dates.push(formatDate(new Date(year, month, d)));
    }
    return dates;
}

function getYearDates(year) {
    const dates = [];
    for (let m = 0; m < 12; m++) {
        dates.push(...getMonthDates(year, m));
    }
    return dates;
}

export function useHabitStats() {
    const { habits, records, settings } = useHabitContext();
    const today = formatDate(new Date());

    return useMemo(() => {
        if (habits.length === 0) {
            return {
                todayCompletion: 0,
                weeklyConsistency: 0,
                monthlyScore: 0,
                currentStreak: 0,
                longestStreak: 0,
                todayCompleted: 0,
                todayTotal: habits.length,
                weeklyData: [],
                monthlyData: [],
                yearlyData: [],
                categoryPerformance: {},
                bestHabitWeek: null,
                worstHabitWeek: null,
                mostConsistentHabit: null,
                yearLongestStreak: 0,
                totalCompletedYear: 0,
                annualScore: 0,
                motivationalMessage: getMotivationalMessage(0),
            };
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Today's completion
        const todayRecords = records[today] || {};
        const todayCompleted = habits.filter((h) => todayRecords[h.id]).length;
        const todayCompletion = Math.round((todayCompleted / habits.length) * 100);

        // Weighted today score
        const todayWeightedMax = habits.reduce((sum, h) => sum + (h.difficulty || 3), 0);
        const todayWeightedDone = habits.filter((h) => todayRecords[h.id]).reduce((sum, h) => sum + (h.difficulty || 3), 0);

        // Weekly consistency
        const weekDates = getWeekDates(now, settings.startDay);
        let weekTotal = 0;
        let weekCompleted = 0;
        weekDates.forEach((date) => {
            const dayRec = records[date] || {};
            habits.forEach((h) => {
                weekTotal++;
                if (dayRec[h.id]) weekCompleted++;
            });
        });
        const weeklyConsistency = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

        // Weekly data for chart
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = weekDates.map((date) => {
            const dayRec = records[date] || {};
            const completed = habits.filter((h) => dayRec[h.id]).length;
            const d = new Date(date + 'T12:00:00');
            return {
                date,
                day: dayNames[d.getDay()],
                completed,
                total: habits.length,
                percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
            };
        });

        // Best/Worst habit of the week
        const habitWeekScores = habits.map((h) => {
            const completed = weekDates.filter((date) => (records[date] || {})[h.id]).length;
            return { ...h, weekCompleted: completed, weekPercentage: Math.round((completed / 7) * 100) };
        });
        const sortedHabits = [...habitWeekScores].sort((a, b) => b.weekCompleted - a.weekCompleted);
        const bestHabitWeek = sortedHabits[0] || null;
        const worstHabitWeek = sortedHabits[sortedHabits.length - 1] || null;

        // Monthly
        const monthDates = getMonthDates(currentYear, currentMonth);
        let monthTotal = 0;
        let monthCompleted = 0;
        let monthWeightedScore = 0;
        let monthWeightedMax = 0;
        monthDates.forEach((date) => {
            const dayRec = records[date] || {};
            habits.forEach((h) => {
                monthTotal++;
                monthWeightedMax += (h.difficulty || 3);
                if (dayRec[h.id]) {
                    monthCompleted++;
                    monthWeightedScore += (h.difficulty || 3);
                }
            });
        });
        const monthlyScore = monthWeightedMax > 0 ? Math.round((monthWeightedScore / monthWeightedMax) * 100) : 0;

        // Monthly data for heatmap
        const monthlyData = monthDates.map((date) => {
            const dayRec = records[date] || {};
            const completed = habits.filter((h) => dayRec[h.id]).length;
            return {
                date,
                completed,
                total: habits.length,
                percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
            };
        });

        // Category performance
        const categories = ['Health', 'Mind', 'Work', 'Custom'];
        const categoryPerformance = {};
        categories.forEach((cat) => {
            const catHabits = habits.filter((h) => h.category === cat);
            if (catHabits.length === 0) {
                categoryPerformance[cat] = 0;
                return;
            }
            let total = 0;
            let completed = 0;
            monthDates.forEach((date) => {
                const dayRec = records[date] || {};
                catHabits.forEach((h) => {
                    total++;
                    if (dayRec[h.id]) completed++;
                });
            });
            categoryPerformance[cat] = total > 0 ? Math.round((completed / total) * 100) : 0;
        });

        // Streak calculation
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const allDates = [];
        const checkDate = new Date(now);
        for (let i = 0; i < 365; i++) {
            allDates.push(formatDate(checkDate));
            checkDate.setDate(checkDate.getDate() - 1);
        }

        for (const date of allDates) {
            const dayRec = records[date] || {};
            const allDone = habits.every((h) => dayRec[h.id]);
            if (allDone && habits.length > 0) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                if (currentStreak === 0 && date !== today) {
                    currentStreak = tempStreak;
                }
                tempStreak = 0;
            }
        }
        if (currentStreak === 0) currentStreak = tempStreak;

        // Year overview
        const yearDates = getYearDates(currentYear);
        let totalCompletedYear = 0;
        let yearWeightedScore = 0;
        let yearWeightedMax = 0;
        yearDates.forEach((date) => {
            const dayRec = records[date] || {};
            habits.forEach((h) => {
                yearWeightedMax += (h.difficulty || 3);
                if (dayRec[h.id]) {
                    totalCompletedYear++;
                    yearWeightedScore += (h.difficulty || 3);
                }
            });
        });
        const annualScore = yearWeightedMax > 0 ? Math.round((yearWeightedScore / yearWeightedMax) * 100) : 0;

        // Yearly data per month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const yearlyData = [];
        for (let m = 0; m < 12; m++) {
            const mDates = getMonthDates(currentYear, m);
            let mTotal = 0;
            let mCompleted = 0;
            mDates.forEach((date) => {
                const dayRec = records[date] || {};
                habits.forEach((h) => {
                    mTotal++;
                    if (dayRec[h.id]) mCompleted++;
                });
            });
            yearlyData.push({
                month: monthNames[m],
                monthIndex: m,
                completed: mCompleted,
                total: mTotal,
                percentage: mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0,
            });
        }

        // Year longest streak
        let yearLongestStreak = 0;
        let yStreak = 0;
        yearDates.forEach((date) => {
            const dayRec = records[date] || {};
            const allDone = habits.length > 0 && habits.every((h) => dayRec[h.id]);
            if (allDone) {
                yStreak++;
                yearLongestStreak = Math.max(yearLongestStreak, yStreak);
            } else {
                yStreak = 0;
            }
        });

        // Most consistent habit
        const habitYearScores = habits.map((h) => {
            const completed = yearDates.filter((date) => (records[date] || {})[h.id]).length;
            return { ...h, yearCompleted: completed, yearPercentage: Math.round((completed / yearDates.length) * 100) };
        });
        const mostConsistentHabit = habitYearScores.sort((a, b) => b.yearCompleted - a.yearCompleted)[0] || null;

        const motivationalMessage = getMotivationalMessage(todayCompletion);

        return {
            todayCompletion,
            todayCompleted,
            todayTotal: habits.length,
            todayWeightedMax,
            todayWeightedDone,
            weeklyConsistency,
            weeklyData,
            monthlyScore,
            monthlyData,
            monthCompleted,
            monthTotal,
            monthWeightedScore,
            monthWeightedMax,
            currentStreak,
            longestStreak,
            categoryPerformance,
            bestHabitWeek,
            worstHabitWeek,
            yearlyData,
            yearLongestStreak,
            totalCompletedYear,
            annualScore,
            mostConsistentHabit,
            motivationalMessage,
        };
    }, [habits, records, settings, today]);
}

function getMotivationalMessage(completion) {
    if (completion === 0) return { text: "Fresh start! Let's crush it today. 🚀", mood: 'neutral' };
    if (completion < 25) return { text: "You've started — keep the momentum going! 💪", mood: 'low' };
    if (completion < 50) return { text: "Almost halfway! Don't stop now. 🔥", mood: 'building' };
    if (completion < 75) return { text: "Great progress — the finish line is in sight! ⚡", mood: 'good' };
    if (completion < 100) return { text: "So close to perfection! Finish strong! 🎯", mood: 'great' };
    return { text: "🏆 100% complete! You're unstoppable!", mood: 'perfect' };
}

export { formatDate, getWeekDates, getMonthDates, getYearDates };
