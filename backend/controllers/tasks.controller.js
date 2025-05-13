import Task from '../models/task.model.js';

export const getDashboardTasks = async (req, res) => {
    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);

    const twentyDaysLater = new Date();
    twentyDaysLater.setDate(today.getDate() + 20);

    const currentTasks = await Task.find({
        dueDate: { $gte: today, $lte: fiveDaysLater },
        completed: false,
    }).sort({ dueDate: 1 });

    const upcomingTasks = await Task.find({
        dueDate: { $gt: fiveDaysLater, $lte: twentyDaysLater },
        completed: false,
    }).sort({ dueDate: 1 });

    res.json({ currentTasks, upcomingTasks });
};
