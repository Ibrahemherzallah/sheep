import Task from '../models/task.model.js';
import Supplimant from "../models/pregnantSupplimants.model.js";
import Sheep from "../models/sheep.model.js";

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
        // ✅ Check for "إسفنجة" task
        if (updated.title === "إسفنجة" && updated.sheepIds?.length > 0) {
            for (const sheepId of updated.sheepIds) {
                const sheep = await Sheep.findById(sheepId).populate('pregnantSupplimans');

                if (!sheep) continue;

                if (!sheep.pregnantSupplimans || sheep.pregnantSupplimans.length === 0) {
                    // 🆕 No previous supplimant → create new
                    const newSupplimant = await Supplimant.create({
                        sheepId,
                        numOfIsfenjeh: 1,
                        numOfHermon: 0,
                    });

                    await Sheep.findByIdAndUpdate(sheepId, {
                        $push: { pregnantSupplimans: newSupplimant._id },
                    });
                } else {
                    // ✅ Already has at least one → increment numOfIsfenjeh in the last one
                    const lastSupplimant = sheep.pregnantSupplimans[sheep.pregnantSupplimans.length - 1];
                    await Supplimant.findByIdAndUpdate(lastSupplimant._id, {
                        $inc: { numOfIsfenjeh: 1 },
                    });
                }
            }
        }
        else if (updated.title === "اعطاء الهرمون" && updated.sheepIds?.length > 0) {
            for (const sheepId of updated.sheepIds) {
                const sheep = await Sheep.findById(sheepId).populate('pregnantSupplimans');
                if (!sheep || sheep.pregnantSupplimans.length === 0) continue;
                // 2. Get the last Supplimant (assuming it's the last in the array)
                const lastSupplimantId = sheep.pregnantSupplimans[sheep.pregnantSupplimans.length - 1]._id;
                // 3. Increment the numOfHermon field by 1
                await Supplimant.findByIdAndUpdate(lastSupplimantId, {
                    $inc: { numOfHermon: 1 }
                });
            }
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

        // ✅ Check for "إسفنجة" task
        if (task.title === "إسفنجة" && task.sheepIds?.length > 0) {
            for (const sheepId of completedSheepIds) {
                const sheep = await Sheep.findById(sheepId).populate('pregnantSupplimans');

                if (!sheep) continue;

                if (!sheep.pregnantSupplimans || sheep.pregnantSupplimans.length === 0) {
                    // 🆕 No previous supplimant → create new
                    const newSupplimant = await Supplimant.create({
                        sheepId,
                        numOfIsfenjeh: 1,
                        numOfHermon: 0,
                    });

                    await Sheep.findByIdAndUpdate(sheepId, {
                        $push: { pregnantSupplimans: newSupplimant._id },
                    });
                } else {
                    // ✅ Already has at least one → increment numOfIsfenjeh in the last one
                    const lastSupplimant = sheep.pregnantSupplimans[sheep.pregnantSupplimans.length - 1];
                    await Supplimant.findByIdAndUpdate(lastSupplimant._id, {
                        $inc: { numOfIsfenjeh: 1 },
                    });
                }
            }
        }
        else if (task.title === "اعطاء الهرمون" && task.sheepIds?.length > 0) {
            for (const sheepId of completedSheepIds) {
                const sheep = await Sheep.findById(sheepId).populate('pregnantSupplimans');
                if (!sheep || sheep.pregnantSupplimans.length === 0) continue;
                // 2. Get the last Supplimant (assuming it's the last in the array)
                const lastSupplimantId = sheep.pregnantSupplimans[sheep.pregnantSupplimans.length - 1]._id;
                // 3. Increment the numOfHermon field by 1
                await Supplimant.findByIdAndUpdate(lastSupplimantId, {
                    $inc: { numOfHermon: 1 }
                });
            }
        }
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


export const completePregnantTask = async (req, res) => {
    try {
        const { id } = req.params;
        let { completedSheepIds, donePregnant } = req.body;
        console.log("the sheep id is : ", id)
        console.log("the donePregnant id is : ", donePregnant)
        console.log("the completedSheepIds id is : ", completedSheepIds)
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'لم يتم العثور على المهمة' });
        }

        // ✅ Use task.sheepIds if completedSheepIds is empty
        if (!completedSheepIds || completedSheepIds.length === 0) {
            completedSheepIds = task.sheepIds.map(sid => sid.toString()); // Convert ObjectId to string
        }

        // Filter out the selected sheep from the original task
        task.sheepIds = task.sheepIds.filter(
            sheepId => !completedSheepIds.includes(sheepId.toString())
        );

        // Save the updated original task
        await task.save();

        if (donePregnant) {
            // ✅ If donePregnant is true: optionally mark complete if no sheep left
            if (task.sheepIds.length === 0) {
                task.completed = true;
                await task.save();
            }

            return res.status(200).json({
                message: 'تم تحديث حالة المهمة بنجاح (حمل مؤكد)',
                task,
            });
        } else {
            // ❌ If not pregnant, create a new task with selected sheep
            const newTask = await Task.create({
                title: 'إسفنجة',
                dueDate: new Date(),
                type: 'injection',
                sheepIds: completedSheepIds,
            });

            return res.status(200).json({
                message: 'تم إنشاء مهمة إسفنجة للخراف المحددة',
                originalTask: task,
                newTask,
            });
        }
    } catch (err) {
        console.error("Error completing pregnant task:", err);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
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