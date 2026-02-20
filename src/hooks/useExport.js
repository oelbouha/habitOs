import { useCallback } from 'react';
import { useHabitContext } from '../context/HabitContext';
import * as XLSX from 'xlsx';
import { formatDate, getMonthDates, getYearDates } from './useHabitStats';

export function useExport() {
    const { habits, records, exportData, importData } = useHabitContext();

    const exportToExcel = useCallback(() => {
        const wb = XLSX.utils.book_new();
        const now = new Date();
        const currentYear = now.getFullYear();

        // Sheet 1: Habit List
        const habitListData = habits.map((h, i) => ({
            '#': i + 1,
            'Name': h.name,
            'Category': h.category,
            'Difficulty': h.difficulty,
            'Created': new Date(h.createdAt).toLocaleDateString(),
        }));
        const ws1 = XLSX.utils.json_to_sheet(habitListData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Habits');

        // Sheet 2: Daily Log
        const yearDates = getYearDates(currentYear);
        const dailyLogData = yearDates.map((date) => {
            const dayRec = records[date] || {};
            const row = { Date: date };
            habits.forEach((h) => {
                row[h.name] = dayRec[h.id] ? '✓' : '';
            });
            const completed = habits.filter((h) => dayRec[h.id]).length;
            row['Completed'] = completed;
            row['Total'] = habits.length;
            row['%'] = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
            return row;
        });
        const ws2 = XLSX.utils.json_to_sheet(dailyLogData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Daily Log');

        // Sheet 3: Monthly Summary
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthlySummaryData = [];
        for (let m = 0; m < 12; m++) {
            const mDates = getMonthDates(currentYear, m);
            let total = 0, completed = 0;
            mDates.forEach((date) => {
                const dayRec = records[date] || {};
                habits.forEach((h) => {
                    total++;
                    if (dayRec[h.id]) completed++;
                });
            });
            monthlySummaryData.push({
                Month: monthNames[m],
                'Total Possible': total,
                'Completed': completed,
                'Score %': total > 0 ? Math.round((completed / total) * 100) : 0,
            });
        }
        const ws3 = XLSX.utils.json_to_sheet(monthlySummaryData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Summary');

        // Sheet 4: Year Summary
        const totalPossible = yearDates.length * habits.length;
        let totalCompleted = 0;
        yearDates.forEach((date) => {
            const dayRec = records[date] || {};
            habits.forEach((h) => {
                if (dayRec[h.id]) totalCompleted++;
            });
        });
        const yearSummaryData = [{
            'Year': currentYear,
            'Total Habits': habits.length,
            'Total Days': yearDates.length,
            'Total Possible': totalPossible,
            'Total Completed': totalCompleted,
            'Annual Score %': totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
        }];
        const ws4 = XLSX.utils.json_to_sheet(yearSummaryData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Year Summary');

        XLSX.writeFile(wb, `HabitOS_Report_${currentYear}.xlsx`);
    }, [habits, records]);

    const exportToCSV = useCallback(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const yearDates = getYearDates(currentYear);

        const headers = ['Date', ...habits.map((h) => h.name), 'Completed', 'Total', '%'];
        const rows = yearDates.map((date) => {
            const dayRec = records[date] || {};
            const completed = habits.filter((h) => dayRec[h.id]).length;
            return [
                date,
                ...habits.map((h) => (dayRec[h.id] ? '1' : '0')),
                completed,
                habits.length,
                habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
            ];
        });

        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HabitOS_${currentYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [habits, records]);

    const exportBackup = useCallback(() => {
        const data = exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HabitOS_Backup_${formatDate(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [exportData]);

    const restoreBackup = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.habits && data.records) {
                        importData(data);
                        resolve(true);
                    } else {
                        reject(new Error('Invalid backup file format'));
                    }
                } catch {
                    reject(new Error('Failed to parse backup file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }, [importData]);

    return { exportToExcel, exportToCSV, exportBackup, restoreBackup };
}
