import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const toDateKey = (date) => format(date, 'yyyy-MM-dd');

export const todayKey = () => toDateKey(new Date());

export const last90DaysKeys = () => {
    const today = new Date();
    const startDate = subDays(today, 89);
    return eachDayOfInterval({ start: startDate, end: today }).map(toDateKey);
};

export const currentWeekKeys = () => {
    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 });
    const endDate = endOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate }).map(toDateKey);
};

export const lastNDaysKeys = (n) => {
    const endDate = new Date();
    const startDate = subDays(endDate, n - 1);
    return eachDayOfInterval({ start: startDate, end: endDate }).map(toDateKey);
};

export const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    const sortedDates = new Set(completedDates.map(date => toDateKey(new Date(date))));
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    let streak = 0;
    let cursorDate = today;
    if (!sortedDates.has(toDateKey(cursorDate)) && !sortedDates.has(toDateKey(yesterday))) {
        streak = 0;
    } else {
        while (sortedDates.has(toDateKey(cursorDate))) {
            streak++;
            cursorDate = subDays(cursorDate, 1);
        }
    }
    return streak;
};

