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

export const getInjectionTasks = async (req, res) => {
    try {
        const today = new Date();
        const tasks = await Task.find({
            type: 'injection',
            dueDate: { $gt: today },
            completed: false,
        })
            .populate('sheepIds')
            .sort({ dueDate: 1 }); // Soonest first

        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching upcoming injections:', err);
        res.status(500).json({ error: 'فشل في جلب المهام' });
    }
}

export const getNextInjectionTaskForSheep = async (req, res) => {
    try {
        const {sheepId} = req.params;

        const task = await Task.findOne({
            type: 'injection',
            sheepIds: sheepId,
            completed: false,
            dueDate: {$gte: new Date()},
        })
            .sort({dueDate: 1}) // soonest upcoming
            .populate('sheepIds');

        if (!task) {
            return res.status(404).json({message: 'No upcoming injection task found.'});
        }

        res.json(task);
    } catch (error) {
        console.error('Error fetching next injection task:', error);
        res.status(500).json({error: 'Failed to fetch task.'});
    }
}

export const getUpcomingInjectionTasksForCycle = async (req, res) => {
    try {
        const { id } = req.params;

        const tasks = await Task.find({
            type: 'injection',
            cycleId: id,
            completed: false,
            dueDate: { $gte: new Date() },
        }).sort({ dueDate: 1 });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No upcoming injection tasks found for this cycle.' });
        }

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching injection tasks for cycle:', error);
        res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
};

export const markTaskComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Task.findByIdAndUpdate(
            id,
            { completed: true },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error("Error marking task complete:", err);
        res.status(500).json({ message: 'Server error' });
    }
};
