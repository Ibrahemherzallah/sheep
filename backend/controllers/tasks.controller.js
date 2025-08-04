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


export const markTaskCompleteForSelectedSheep = async (req, res) => {
    const { id: taskId } = req.params;
    const { completedSheepIds } = req.body;
    console.log("taskId is : ", taskId)

    console.log("completedSheepIds is : ", completedSheepIds)

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        console.log("task is : ", task)

        // Filter out completed sheep
        task.sheepIds = task.sheepIds.filter(id => !completedSheepIds.includes(id.toString()));
        console.log("task.sheepIds is : ", task.sheepIds)
        if (task.sheepIds.length === 0) {
            task.completed = true;
        }

        await task.save();
        res.status(200).json({ message: 'تم تحديث المهمة بنجاح', task });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task', error: err.message });
    }
};




export const createTask = async (req, res) => {
    try {
        const { title, dueDate, sheepIds, type, description, cycleId } = req.body;

        const task = await Task.create({
            title,
            dueDate,
            sheepIds,
            type,
            description,
            cycleId,
        });

        res.status(201).json(task);
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ message: "Failed to create task" });
    }
};




// Update due date
export const updateTaskDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { dueDate } = req.body;

        if (!dueDate) {
            return res.status(400).json({ message: 'Due date is required.' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { dueDate },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.status(200).json({ message: 'تم تحديث تاريخ المهمة بنجاح', task: updatedTask });
    } catch (err) {
        console.error('Error updating task date:', err);
        res.status(500).json({ message: 'Server error while updating task.' });
    }
};

// Delete task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Task.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.status(200).json({ message: 'تم حذف المهمة بنجاح' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Server error while deleting task.' });
    }
};