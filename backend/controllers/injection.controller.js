import InjectionModel from '../models/injection.model.js';
import Sheep from '../models/sheep.model.js';
import InjectionType from '../models/injectionType.model.js'; // Assuming you have this
import Task from '../models/task.model.js';
import StockModel from "../models/stock.model.js";
import {addDays} from "../services/taskService.js";
import Supplimant from "../models/pregnantSupplimants.model.js";

export const createInjection = async (req, res) => {
    try {
        let { sheepId, injectionType, numOfInject, injectDate, notes } = req.body;

        // Make sure sheepId is always an array
        if (!Array.isArray(sheepId)) {
            sheepId = sheepId ? [sheepId] : [];
        }

        if (!sheepId.length) {
            return res.status(400).json({ error: 'يجب اختيار خروف واحد على الأقل' });
        }

        const baseDate = new Date(injectDate || Date.now());

        const injectionTypeDoc = await StockModel.findById(injectionType);
        if (!injectionTypeDoc) {
            return res.status(400).json({ error: 'Injection type not found in stock' });
        }

        const injectionName = injectionTypeDoc.name;

        // Fetch all sheep once
        const sheepList = await Sheep.find({
            _id: { $in: sheepId }
        }).populate('pregnantSupplimans');

        const sheepMap = new Map(
            sheepList.map((sheep) => [String(sheep._id), sheep])
        );

        // =========================
        // Special case: اسفنجة
        // =========================
        if (injectionName === 'اسفنجة') {
            const hormoneDate = new Date(baseDate);
            hormoneDate.setDate(hormoneDate.getDate() + 12);

            await Task.create({
                title: 'اعطاء الهرمون',
                dueDate: hormoneDate,
                sheepIds: sheepId,
                type: 'injection',
                notes: 'متابعة بعد 12 يوم من الاسفنجة',
            });

            await Promise.all(
                sheepId.map(async (sheepIdd) => {
                    const sheep = sheepMap.get(String(sheepIdd));
                    if (!sheep) return;

                    if (!sheep.pregnantSupplimans || sheep.pregnantSupplimans.length === 0) {
                        const newSupplimant = await Supplimant.create({
                            sheepId: sheepIdd,
                            numOfIsfenjeh: 1,
                            numOfHermon: 0,
                        });

                        await Sheep.updateOne(
                            { _id: sheepIdd },
                            { $push: { pregnantSupplimans: newSupplimant._id } }
                        );
                    } else {
                        const lastSupplimant =
                            sheep.pregnantSupplimans[sheep.pregnantSupplimans.length - 1];

                        await Supplimant.updateOne(
                            { _id: lastSupplimant._id },
                            { $inc: { numOfIsfenjeh: 1 } }
                        );
                    }

                    await deleteTasksForSheep(sheepIdd);
                })
            );

            return res.status(201).json({
                message: 'تمت إضافة الاسفنجة بنجاح',
            });
        }

        // =========================
        // Special case: اعطاء الهرمون
        // =========================
        if (injectionName === 'اعطاء الهرمون') {
            const checkPregnancy = new Date(baseDate);
            checkPregnancy.setDate(checkPregnancy.getDate() + 30);

            await Task.create({
                title: 'فحص الحمل',
                dueDate: checkPregnancy,
                sheepIds: sheepId,
                type: 'pregnancy-check',
                notes: 'فحص الحمل',
            });

            await Promise.all(
                sheepId.map(async (sheepIdd) => {
                    const sheep = sheepMap.get(String(sheepIdd));
                    if (!sheep) return;

                    if (!sheep.pregnantSupplimans || sheep.pregnantSupplimans.length === 0) {
                        const newSupplimant = await Supplimant.create({
                            sheepId: sheepIdd,
                            numOfIsfenjeh: 1,
                            numOfHermon: 1,
                        });

                        await Sheep.updateOne(
                            { _id: sheepIdd },
                            { $push: { pregnantSupplimans: newSupplimant._id } }
                        );
                    } else {
                        const lastSupplimant =
                            sheep.pregnantSupplimans[sheep.pregnantSupplimans.length - 1];

                        await Supplimant.updateOne(
                            { _id: lastSupplimant._id },
                            { $inc: { numOfHermon: 1 } }
                        );
                    }

                    await deleteTasksForHermonSheep(sheepIdd);
                })
            );

            return res.status(201).json({
                message: 'تمت إضافة الهرمون بنجاح',
            });
        }

        // =========================
        // Normal injection flow
        // =========================
        const newInjection = await InjectionModel.create({
            sheepId,
            injectionType,
            numOfInject,
            injectDate,
            notes,
        });

        // Update all sheep once
        await Sheep.updateMany(
            { _id: { $in: sheepId } },
            { $push: { injectionCases: newInjection._id } }
        );

        // Reputation: 6 months
        if (injectionTypeDoc?.reputation === '6m') {
            if (numOfInject === 1) {
                const reinject15DaysLater = new Date(baseDate);
                reinject15DaysLater.setDate(reinject15DaysLater.getDate() + 15);

                await Task.insertMany([
                    {
                        title: ` جرعة ثانية من طعم ${injectionName}`,
                        dueDate: reinject15DaysLater,
                        sheepIds: sheepId,
                        type: 'injection',
                        notes: 'تطعيم متابعة بعد 15 يوم',
                    },
                ]);

                await Promise.all(
                    sheepId.map((sheepIdd) =>
                        deleteTasksForFirstInjectionSheep(sheepIdd, injectionName)
                    )
                );
            } else {
                const reinject6MonthsLater = new Date(baseDate);
                reinject6MonthsLater.setMonth(reinject6MonthsLater.getMonth() + 6);

                await Task.insertMany([
                    {
                        title: ` جرعة أولى من دواء ${injectionName}`,
                        dueDate: reinject6MonthsLater,
                        sheepIds: sheepId,
                        type: 'injection',
                        notes: 'تطعيم متابعة بعد 6 أشهر',
                    },
                ]);
            }
        }

        // Reputation: 1 year
        if (injectionTypeDoc?.reputation === '1y') {
            const reInject1YearLater = new Date(baseDate);
            reInject1YearLater.setFullYear(reInject1YearLater.getFullYear() + 1);

            await Task.insertMany([
                {
                    title: `جرعة متابعة من دواء ${injectionName}`,
                    dueDate: reInject1YearLater,
                    sheepIds: sheepId,
                    type: 'injection',
                    notes: 'تطعيم متابعة بعد سنة',
                },
            ]);
        }

        return res.status(201).json({
            message: 'تمت الإضافة بنجاح',
            injection: newInjection
        });

    } catch (err) {
        console.error('Error adding injection:', err);
        return res.status(500).json({ error: 'فشل في إضافة الطعم' });
    }
};

export const getInjection = async (req, res) => {
    try {
        const injections = await InjectionModel.find()
            .populate('sheepId')
            .populate('injectionType')
            .sort({ injectDate: -1 }); // Most recent first

        res.status(200).json(injections);
    } catch (err) {
        console.error('Error fetching injections:', err);
        res.status(500).json({ error: 'فشل في جلب الطعومات' });
    }
}


const TARGET_TITLES_AFTER_PREGNANT = ["إسفنجة", "فحص الحمل"];

export const deleteTasksForSheep = async (sheepId) => {
    console.log("The sheeps id is :" , sheepId)
    try {
        const tasks = await Task.find({
            title: { $in: TARGET_TITLES_AFTER_PREGNANT },
            sheepIds: sheepId
        });
        console.log("tasks is : ", tasks)
        for (const task of tasks) {
            if (task.sheepIds.length === 1) {
                // Task only has this one sheep — delete whole task
                await Task.findByIdAndDelete(task._id);
            } else {
                // Task has multiple sheep — remove this sheep only
                await Task.findByIdAndUpdate(
                    task._id,
                    { $pull: { sheepIds: sheepId } }
                );
            }
        }

        console.log(`Cleaned up tasks for sheep ${sheepId}`);
    } catch (error) {
        console.error(`Failed to clean up tasks for sheep ${sheepId}:`, error);
    }
};

export const deleteTasksForHermonSheep = async (sheepId) => {
    console.log("The sheeps id is :" , sheepId)
    try {
        const tasks = await Task.find({
            title: { $in: "اعطاء الهرمون" },
            sheepIds: sheepId
        });
        console.log("tasks is : ", tasks)
        for (const task of tasks) {
            if (task.sheepIds.length === 1) {
                // Task only has this one sheep — delete whole task
                await Task.findByIdAndDelete(task._id);
            } else {
                // Task has multiple sheep — remove this sheep only
                await Task.findByIdAndUpdate(
                    task._id,
                    { $pull: { sheepIds: sheepId } }
                );
            }
        }

        console.log(`Cleaned up tasks for sheep ${sheepId}`);
    } catch (error) {
        console.error(`Failed to clean up tasks for sheep ${sheepId}:`, error);
    }
};


export const deleteTasksForFirstInjectionSheep = async (sheepId,injectionName) => {
    console.log("The sheeps id is :" , sheepId)
    console.log("The injectionName id is :" , injectionName)
    try {
        const tasks = await Task.find({
            title: { $in: ` جرعة أولى من دواء ${injectionName}` },
            sheepIds: sheepId
        });
        console.log("tasks is : ", tasks)
        for (const task of tasks) {
            if (task.sheepIds.length === 1) {
                // Task only has this one sheep — delete whole task
                await Task.findByIdAndDelete(task._id);
            } else {
                // Task has multiple sheep — remove this sheep only
                await Task.findByIdAndUpdate(
                    task._id,
                    { $pull: { sheepIds: sheepId } }
                );
            }
        }

        console.log(`Cleaned up tasks for sheep ${sheepId}`);
    } catch (error) {
        console.error(`Failed to clean up tasks for sheep ${sheepId}:`, error);
    }
};


