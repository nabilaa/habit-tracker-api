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
    if (!completedDates || completedDates.length === 0) return { current: 0, longest: 0};
    const uniqueCompletedDateKeys = new Set(completedDates.map(completedDate => toDateKey(new Date(completedDate))));
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    let currentStreak = 0;
    
    let streakCursorDate = today;
    if (!uniqueCompletedDateKeys.has(toDateKey(streakCursorDate)) && !uniqueCompletedDateKeys.has(toDateKey(yesterday))) {
        currentStreak = 0;
    } else {
        while (uniqueCompletedDateKeys.has(toDateKey(streakCursorDate))) {
            currentStreak++;
            streakCursorDate = subDays(streakCursorDate, 1);
        }
    }
    
    const chronologicallySortedDateKeys = [...uniqueCompletedDateKeys].sort();
    let longestStreak = 0;
    let streakLength = 0;
    let previousDateKey = null;
    for (const dateKey of chronologicallySortedDateKeys) {
        if (previousDateKey) {
            const currentDate = new Date(dateKey);
            const previousDate = new Date(previousDateKey);
            const dayDifference = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));
            if (dayDifference === 1) streakLength += 1;
            else streakLength = 1;
        } else {
            streakLength = 1;
        }
        if (streakLength > longestStreak) {
            longestStreak = streakLength;
        }
        previousDateKey = dateKey;
    }
    return { current: currentStreak, longest: longestStreak };
};
