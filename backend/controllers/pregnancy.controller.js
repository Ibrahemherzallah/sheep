import { createBirthRelatedTasks } from '../services/taskService.js';
import Pregnancy from '../models/pregnancy.model.js';
import Sheep from '../models/sheep.model.js';
import Task from "../models/task.model.js";
import Supplimant from "../models/pregnantSupplimants.model.js";
import DiedLabor from "../models/diedLabor.model.js";

export const createPregnancies = async (req, res) => {
    try {
        const { sheepIds, pregnantDate, expectedBornDate, notes } = req.body;
        const createdPregnancies = [];
        const createdTasks = [];

        for (const sheepId of sheepIds) {
            const sheep = await Sheep.findById(sheepId);

            if (!sheep) {
                return res.status(404).json({ error: `Sheep with ID ${sheepId} not found` });
            }
            if (sheep.isPregnant) {
                console.warn(`Sheep ${sheepId} is already pregnant, skipping.`);
                return res.status(404).json({ error: `النعجة صاحبة الرقم  ${sheep.sheepNumber} هي حامل ` });
            }
            if (sheep.sheepGender === "ذكر") {
                console.warn(`Sheep ${sheepId} is male, skipping.`);
                return res.status(404).json({ error: `الخروف صاحب الرقم${sheep.sheepNumber} لا يمكن ان يحمل لانه ذكر ` });
            }
            const order = sheep.pregnantCases.length + 1;

            const pregnancy = await Pregnancy.create({
                sheepId,
                pregnantDate,
                expectedBornDate,
                order,
                notes
            });

            // Update sheep with new pregnancy
            sheep.isPregnant = true;
            sheep.pregnantCases.push(pregnancy._id);
            await sheep.save();

            createdPregnancies.push(pregnancy);

            await deleteTasksForSheepAfterPregnant(sheepId);

        }
        const task = await Task.create({
            title: 'تاريخ الولادة المتوقع',
            dueDate: new Date(expectedBornDate),
            type: 'born',
            sheepIds

        });
        createdTasks.push(task);
        const pasteurellaDate = new Date(pregnantDate);

        pasteurellaDate.setDate(pasteurellaDate.getDate() + 90);
        const pregnancyFix = new Date(pregnantDate);
        pregnancyFix.setDate(pasteurellaDate.getDate() + 95);

        await Task.create({
            title: 'إعطاء لقاح الباستيريلا وال فيرست ايد',
            dueDate: pasteurellaDate,
            type: 'injection',
            sheepIds
        });

        await Task.create({
            title: 'إعطاء لقاح تثبيت الحمل',
            dueDate: pregnancyFix,
            type: 'injection',
            sheepIds
        });


        res.status(201).json({
            message: "Pregnancies and expected birth tasks created.",
            data: { pregnancies: createdPregnancies, tasks: createdTasks }
        });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create pregnancies" });
    }
};

export const updatePregnancyDates = async (req, res) => {
    try {
        const { pregnancyId } = req.params;
        const { daysPregnant } = req.body; // only this field from frontend

        const pregnancy = await Pregnancy.findById(pregnancyId);
        if (!pregnancy) return res.status(404).json({ error: "Pregnancy not found" });

        const sheepId = pregnancy.sheepId;
        const sheep = await Sheep.findById(sheepId);
        if (!sheep) return res.status(404).json({ error: "Sheep not found" });

        // === calculate new dates ===
        const today = new Date();
        const pregnantDate = new Date(today);
        pregnantDate.setDate(today.getDate() - daysPregnant);

        const expectedBornDate = new Date(pregnantDate);
        expectedBornDate.setDate(pregnantDate.getDate() + 150);

        // === update the pregnancy ===
        pregnancy.pregnantDate = pregnantDate;
        pregnancy.expectedBornDate = expectedBornDate;
        await pregnancy.save();

        // === recalc related task dates ===
        const pasteurellaDate = new Date(pregnantDate);
        pasteurellaDate.setDate(pasteurellaDate.getDate() + 90);

        console.log("pasteurellaDate : ",  pasteurellaDate)
        const pregnancyFixDate = new Date(pregnantDate);
        pregnancyFixDate.setDate(pregnancyFixDate.getDate() + 95);
        console.log("pregnancyFixDate : ",  pregnancyFixDate)

        const handleTaskUpdate = async (type, title, newDate) => {
            const existingTasks = await Task.find({ type, title, sheepIds: sheepId });

            for (const task of existingTasks) {
                console.log(`Updating task [${task.title}] to date:`, newDate);

                if (task.sheepIds.length === 1) {
                    task.dueDate = newDate;
                    await task.save();
                } else {
                    task.sheepIds = task.sheepIds.filter(
                        (id) => id.toString() !== sheepId.toString()
                    );
                    await task.save();

                    await Task.create({
                        title,
                        dueDate: newDate,
                        type,
                        sheepIds: [sheepId],
                    });
                }
            }
        };

        await handleTaskUpdate("born", "تاريخ الولادة المتوقع", expectedBornDate);

        await handleTaskUpdate(
            "injection",
            "إعطاء لقاح الباستيريلا وال فيرست ايد",
            pasteurellaDate
        );

        await handleTaskUpdate(
            "injection",
            "إعطاء لقاح تثبيت الحمل",
            pregnancyFixDate
        );

        res.json({
            message: "تم تحديث حالة الحمل وتعديل المهام المرتبطة.",
            updatedPregnancy: pregnancy,
        });
    } catch (err) {
        console.error("Error updating pregnancy:", err);
        res.status(500).json({ error: "حدث خطأ أثناء تحديث التواريخ." });
    }
};

export const getAllPregnancies = async (req, res) => {
    try {
        const pregnancies = await Pregnancy.find().populate('sheepId');
        res.json(pregnancies);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get pregnancies" });
    }
};

export const getPregnancyById = async (req, res) => {
    try {
        const pregnancy = await Pregnancy.findById(req.params.id).populate('sheepId');
        if (!pregnancy) return res.status(404).json({ error: 'Not found' });
        res.json(pregnancy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get pregnancy" });
    }

};

export const updateMilkInfo = async (req, res) => {
    try {
        const { sheepId, milkAmount, milkProduceDate, notes } = req.body;


        if (!sheepId) {
            return res.status(400).json({ error: 'sheepId is required' });
        }

        const latestPregnancy = await Pregnancy.findOne({ sheepId }).sort({ createdAt: -1 });

        if (!latestPregnancy) {
            return res.status(404).json({ error: 'No pregnancy record found for this sheep' });
        }

        latestPregnancy.milkAmount = milkAmount;
        latestPregnancy.startMilkDate = milkProduceDate;
        latestPregnancy.milkNotes = notes;

        await latestPregnancy.save();

        res.status(200).json({ message: 'Milk info updated successfully', data: latestPregnancy });
    } catch (error) {
        console.error('Error updating milk info:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateEndMilkInfo = async (req, res) => {
    try {
        const { sheepId, milkEndDate, notes } = req.body;

        if (!sheepId) {
            return res.status(400).json({ error: 'sheepId is required' });
        }

        const latestPregnancy = await Pregnancy.findOne({ sheepId }).sort({ createdAt: -1 });

        if (!latestPregnancy) {
            return res.status(404).json({ error: 'No pregnancy record found for this sheep' });
        }

        latestPregnancy.endMilkDate = milkEndDate;
        latestPregnancy.milkNotes = notes;

        await latestPregnancy.save();

        res.status(200).json({ message: 'End milk info updated successfully', data: latestPregnancy });
    } catch (error) {
        console.error('Error updating end milk info:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateMilkAmountOnly = async (req, res) => {
    try {
        const { sheepId, milkAmount } = req.body;

        if (!sheepId) {
            return res.status(400).json({ error: 'sheepId and valid milkAmount are required' });
        }

        // Find the latest pregnancy for the sheep
        const latestPregnancy = await Pregnancy.findOne({ sheepId }).sort({ createdAt: -1 });

        if (!latestPregnancy) {
            return res.status(404).json({ error: 'لم يتم العثور على سجل حمل لهذا الغنم' });
        }

        latestPregnancy.milkAmount = milkAmount;

        await latestPregnancy.save();

        res.status(200).json({ message: 'تم تحديث كمية الحليب بنجاح', data: latestPregnancy });
    } catch (error) {
        console.error('Error updating milk amount:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

export const updateOnePregnancy = async (req, res) => {
    try {
        const { males, females, notes, source } = req.body;
        console.log("source is : ", source)
        if(source === "edit") {
            const updated = await Pregnancy.findByIdAndUpdate(
                req.params.id,
                {
                    numberOfMaleLamb: males,
                    numberOfFemaleLamb: females,
                    notes,
                },
                { new: true }
            );
            res.status(200).json(updated);

        }
        else if(source === "died") {
            const updated = await Pregnancy.findByIdAndUpdate(
                req.params.id,
                {
                    numberOfMaleLambDied: males,
                    numberOfFemaleLambDied: females,
                    notes,
                },
                { new: true }
            );
            res.status(200).json(updated);

        }
        else {
            res.status(500).json({ error: "فشل تعديل الولادة" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل تعديل الولادة" });
    }
};

export const updateLastPregnanciesAfterBirth = async (req, res) => {
    try {
        const { bornDate, births, notes } = req.body;

        const updatedPregnancies = [];
        const allBornedSheepIds = [];

        for (const birth of births) {
            const { sheepId, numberOfMaleLamb, numberOfFemaleLamb } = birth;

            const sheep = await Sheep.findById(sheepId).populate('pregnantCases');

            if (!sheep || sheep.pregnantCases.length === 0) {
                console.warn(`No pregnancies found for sheep ${sheepId}`);
                continue;
            }

            // Get most recent pregnancy
            const lastPregnancyId = sheep.pregnantCases[sheep.pregnantCases.length - 1];

            const updatedPregnancy = await Pregnancy.findByIdAndUpdate(
                lastPregnancyId,
                {
                    bornDate,
                    numberOfMaleLamb,
                    numberOfFemaleLamb,
                    notes
                },
                { new: true }
            );

            // Set isPregnant to false after birth
            await Sheep.findByIdAndUpdate(sheepId, { isPregnant: false });

            //
            // 3. Create Supplimant record
            const newSupplimant = await Supplimant.create({
                sheepId,
                numOfIsfenjeh: 0,
                numOfHermon: 0,
            });

            sheep.pregnantSupplimans.push(newSupplimant._id);
            // 5. Save updated sheep
            await sheep.save();

            allBornedSheepIds.push(sheepId);
            updatedPregnancies.push(updatedPregnancy);


            // 🔥 Call the cleanup function here
            await deleteTasksForSheepAfterBirth(sheepId);

        }


        // Create tasks for all borned sheep
        if (allBornedSheepIds.length > 0) {
            await createBirthRelatedTasks({ bornDate }, allBornedSheepIds);
        }

        res.status(200).json({
            message: "Pregnancies updated, sheep status set, and tasks created.",
            data: updatedPregnancies
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل تعديل الحمل بعد الولادة" });
    }
};


const TARGET_TITLES_AFTER_PREGNANT = ["إسفنجة", "اعطاء الهرمون", "فحص الحمل"];
const TARGET_TITLES_AFTER_BIRTH = ["تاريخ الولادة المتوقع", "إعطاء لقاح الباستيريلا وال فيرست ايد", "إعطاء لقاح تثبيت الحمل"];

export const deleteTasksForSheepAfterBirth = async (sheepId) => {
    try {
        const tasks = await Task.find({
            title: { $in: TARGET_TITLES_AFTER_BIRTH },
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

export const getTotalBornLambs = async (req, res) => {
    try {
        const result = await Pregnancy.aggregate([
            {
                $group: {
                    _id: null,
                    totalMaleLambs: { $sum: "$numberOfMaleLamb" },
                    totalFemaleLambs: { $sum: "$numberOfFemaleLamb" }
                }
            }
        ]);
        console.log("result is :", result)
        // If no pregnancies yet
        if (result.length === 0) {
            return res.json({
                totalMaleLambs: 0,
                totalFemaleLambs: 0
            });
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export const getTotalAliveLambs = async (req, res) => {
    try {
        const result = await Pregnancy.aggregate([
            {
                $group: {
                    _id: null,
                    aliveMale: { $sum: { $subtract: ["$numberOfMaleLamb", "$deadMaleLambs"] } },
                    aliveFemale: { $sum: { $subtract: ["$numberOfFemaleLamb", "$deadFemaleLambs"] } }
                }
            }
        ]);

        if (result.length === 0) {
            return res.json({
                aliveMale: 0,
                aliveFemale: 0
            });
        }

        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getTotalDeadLambs = async (req, res) => {
    try {
        const pregResult = await Pregnancy.aggregate([
            {
                $group: {
                    _id: null,
                    totalDeadMale: { $sum: "$numberOfMaleLambDied" },
                    totalDeadFemale: { $sum: "$numberOfFemaleLambDied" }
                }
            }
        ]);
        const pregDeadMale = pregResult[0]?.totalDeadMale || 0;
        const pregDeadFemale = pregResult[0]?.totalDeadFemale || 0;

        // 2️⃣ deaths from DiedLabor
        const laborResult = await DiedLabor.aggregate([
            {
                $group: {
                    _id: null,
                    totalDeadMale: { $sum: "$males" },
                    totalDeadFemale: { $sum: "$females" }
                }
            }
        ]);

        const laborDeadMale = laborResult[0]?.totalDeadMale || 0;
        const laborDeadFemale = laborResult[0]?.totalDeadFemale || 0;


        // 3️⃣ combine totals
        const totalDeadMale = pregDeadMale + laborDeadMale;
        const totalDeadFemale = pregDeadFemale + laborDeadFemale;

        res.json({
            totalDeadMale,
            totalDeadFemale,
            totalDeaths: totalDeadMale + totalDeadFemale
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getMonthlySummary = async (req, res) => {
    try {
        // 1️⃣ Pregnancy monthly summary
        const pregSummary = await Pregnancy.aggregate([
            { $match: { bornDate: { $ne: null } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$bornDate" },
                        month: { $month: "$bornDate" }
                    },
                    maleBorn: { $sum: "$numberOfMaleLamb" },
                    femaleBorn: { $sum: "$numberOfFemaleLamb" },
                    maleDied: { $sum: "$numberOfMaleLambDied" },
                    femaleDied: { $sum: "$numberOfFemaleLambDied" }
                }
            }
        ]);

        // 2️⃣ DiedLabor monthly summary
        const laborSummary = await DiedLabor.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    maleDied: { $sum: "$males" },
                    femaleDied: { $sum: "$females" }
                }
            }
        ]);

        // 3️⃣ Merge the 2 arrays
        const summaryMap = new Map();

        // Add pregnancy data
        pregSummary.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            summaryMap.set(key, {
                year: item._id.year,
                month: item._id.month,
                maleBorn: item.maleBorn,
                femaleBorn: item.femaleBorn,
                maleDied: item.maleDied,
                femaleDied: item.femaleDied,
            });
        });

        // Add labor data
        laborSummary.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            const existing = summaryMap.get(key) || {
                year: item._id.year,
                month: item._id.month,
                maleBorn: 0,
                femaleBorn: 0,
                maleDied: 0,
                femaleDied: 0
            };
            existing.maleDied += item.maleDied;
            existing.femaleDied += item.femaleDied;
            summaryMap.set(key, existing);
        });

        // Convert map → array
        const finalSummary = Array.from(summaryMap.values())
            .map(item => ({
                ...item,
                births: item.maleBorn + item.femaleBorn,
                deaths: item.maleDied + item.femaleDied,
                net: (item.maleBorn + item.femaleBorn) - (item.maleDied + item.femaleDied)
            }))
            .sort((a, b) => b.year - a.year || b.month - a.month);

        res.json(finalSummary);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};


export const getYearlySummary = async (req, res) => {
    try {
        // 1️⃣ Pregnancy yearly summary
        const pregSummary = await Pregnancy.aggregate([
            { $match: { bornDate: { $ne: null } } },
            {
                $group: {
                    _id: { year: { $year: "$bornDate" } },
                    maleBorn: { $sum: "$numberOfMaleLamb" },
                    femaleBorn: { $sum: "$numberOfFemaleLamb" },
                    maleDied: { $sum: "$numberOfMaleLambDied" },
                    femaleDied: { $sum: "$numberOfFemaleLambDied" }
                }
            }
        ]);

        // 2️⃣ DiedLabor yearly summary
        const laborSummary = await DiedLabor.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$date" } },
                    maleDied: { $sum: "$males" },
                    femaleDied: { $sum: "$females" }
                }
            }
        ]);

        // 3️⃣ Merge both results
        const summaryMap = new Map();

        pregSummary.forEach(item => {
            summaryMap.set(item._id.year, {
                year: item._id.year,
                maleBorn: item.maleBorn,
                femaleBorn: item.femaleBorn,
                maleDied: item.maleDied,
                femaleDied: item.femaleDied
            });
        });

        laborSummary.forEach(item => {
            const prev = summaryMap.get(item._id.year) || {
                year: item._id.year,
                maleBorn: 0,
                femaleBorn: 0,
                maleDied: 0,
                femaleDied: 0
            };
            prev.maleDied += item.maleDied;
            prev.femaleDied += item.femaleDied;
            summaryMap.set(item._id.year, prev);
        });

        const final = Array.from(summaryMap.values())
            .map(item => ({
                ...item,
                births: item.maleBorn + item.femaleBorn,
                deaths: item.maleDied + item.femaleDied,
                net: (item.maleBorn + item.femaleBorn) - (item.maleDied + item.femaleDied)
            }))
            .sort((a, b) => b.year - a.year);

        res.json(final);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const deleteTasksForSheepAfterPregnant = async (sheepId) => {
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




export const deletePregnancy = async (req, res) => {
    try {
        const deleted = await Pregnancy.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted', deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete pregnancy" });
    }

};
