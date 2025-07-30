import ReportModel from "../models/report.model.js";
import Cycle from '../models/cycle.model.js';
import CycleInjection from '../models/cycleInjection.model.js';
import Task from '../models/task.model.js';
import StockModel from "../models/stock.model.js";
import CycleInventory from "../models/cycleInventory.js";

export const createReport = async (req, res) => {
    try {
        const { cycleId, startDate, endDate, numOfFeed, numOfMilk, vitamins, priceOfMilk, priceOfFeed, strawAmount, priceOfStraw } = req.body;
        const newReport = new ReportModel({
            cycleId,
            startDate,
            endDate,
            numOfFeed,
            priceOfFeed,
            numOfMilk,
            priceOfMilk,
            vitamins,
            strawAmount,
            priceOfStraw
        });

        const isCycle = await Cycle.findByIdAndUpdate(
            cycleId,
            { $push: { reports: newReport._id } },
            { new: true }
        );

        if (!isCycle) {
            return res.status(400).json({ message: 'Cycle not found' });
        }

        // ✅ Update Feed stock safely
        if (numOfFeed && numOfFeed > 0) {
            const feedStock = await StockModel.findOne({ type: 'Feed', section: 'cycle' });

            if (!feedStock || feedStock.quantity < numOfFeed) {
                return res.status(400).json({
                    message: 'مخزون علف غير كافي',
                });
            }

            // Safe to decrement
            await StockModel.updateOne(
                { _id: feedStock._id },
                { $inc: { quantity: -numOfFeed } }
            );
        }

// ✅ Update Vitamins stock safely
        if (vitamins && vitamins.length > 0) {
            for (const vitamen of vitamins) {
                const { vitamin, amount } = vitamen;

                const vitaminStock = await StockModel.findOne({
                    _id: vitamin,
                    type: 'Vitamins',
                    section: 'cycle',
                });

                if (!vitaminStock || vitaminStock.quantity < amount) {
                    return res.status(400).json({
                        message: `مخزون فيتامين غير كافي${vitamin}`,
                    });
                }

                await StockModel.updateOne(
                    { _id: vitaminStock._id },
                    { $inc: { quantity: -amount } }
                );
            }
        }


        // ✅ Update Feed stock safely
// ✅ Update Vitamins stock safely
// 🔁 Update related CycleInventory records (علف, قش, حليب)
        const inventoryUpdates = [
            { type: 'علف', quantity: numOfFeed, price: priceOfFeed },
            { type: 'قش', quantity: strawAmount, price: priceOfStraw },
            { type: 'حليب', quantity: numOfMilk, price: priceOfMilk },
        ];

        for (const item of inventoryUpdates) {
            const quantity = Number(item.quantity);
            const price = Number(item.price);

            if (!isNaN(quantity) && !isNaN(price)) {
                await CycleInventory.updateOne(
                    { cycleId, type: item.type },
                    {
                        $inc: {
                            quantity,
                            price,
                        },
                    }
                );
            } else {
                console.warn(`Skipping item with invalid number:`, item);
            }
        }


        await newReport.save();




        res.status(201).json({
            message: 'Report created, linked to cycle, and stock updated',
            data: newReport,
        });
    } catch (err) {
        console.error('❌ Error creating report:', err);
        res.status(500).json({ error: 'Failed to create report' });
    }
};

export const getReportsByCycleId = async (req, res) => {
    try {
        const { cycleId } = req.params;

        // Check if the cycle exists
        const cycleExists = await Cycle.findById(cycleId);
        if (!cycleExists) {
            return res.status(404).json({ error: 'Cycle not found' });
        }

        // Fetch and sort reports by startDate
        const reports = await ReportModel.find({ cycleId })
            .populate('vitamins.vitamin')
            .sort({ startDate: 1 });

        // Add order to each report
        const reportsWithOrder = reports.map((report, index) => ({
            ...report.toObject(), // convert Mongoose document to plain object
            order: index + 1,
        }));

        res.status(200).json(reportsWithOrder);
    } catch (error) {
        console.error('Error fetching reports for cycle:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

export const addInjectionToCycle = async (req, res) => {
    try {
        const { cycleId, injectionTypeId, numOfInject, injectDate, notes } = req.body;

        // Validate required fields
        if (!cycleId || !injectionTypeId || !injectDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Fetch the cycle object to get its number
        const cycle = await Cycle.findById(cycleId);
        if (!cycle) {
            return res.status(404).json({ error: "الدورة غير موجودة" });
        }

        // Create injection
        const newInjection = await CycleInjection.create({
            cycleId,
            injectionType: injectionTypeId,
            numOfInject,
            injectDate,
            notes,
        });

        // Add injection to the cycle
        await Cycle.findByIdAndUpdate(cycleId, {
            $push: { injectionCases: newInjection._id },
        });

        // Fetch the injection type
        const injectionType = await StockModel.findById(injectionTypeId);

        // Create a task if reputation is '6m' and dose is 1
        if (injectionType?.reputation === '6m' && numOfInject === 1) {
            const dueDate = new Date(injectDate);
            dueDate.setDate(dueDate.getDate() + 15); // 15 days later

            await Task.create({
                title: `موعد إعادة التطعيم (${injectionType.name}) - دورة رقم ${cycle.number}`,
                dueDate,
                type: 'injection',
                completed: false,
                sheepIds: [],
                cycleId: cycle._id,
            });
        }

        res.status(201).json({ message: 'تم إضافة التطعيم وربطه بالدورة بنجاح', injection: newInjection });
    } catch (error) {
        console.error("Error adding injection to cycle:", error);
        res.status(500).json({ error: "فشل في إضافة التطعيم" });
    }
};

export const endCycle = async (req, res) => {
    try {
        const {
            cycleId,
            numOfSell,
            totalKilos,
            priceOfKilo,
            numOfDied,
            numOfStock,
            endDate
        } = req.body;


        const updatedCycle = await Cycle.findByIdAndUpdate(
            cycleId,
            {
                numOfSell,
                totalKilos,
                priceOfKilo,
                numOfDied,
                numOfStock,
                endDate,
                status: 'منتهية' // Arabic status
            },
            { new: true }
        );

        if (!updatedCycle) {
            return res.status(404).json({ error: 'Cycle not found' });
        }

        res.status(200).json({
            message: 'Cycle ended successfully',
            data: updatedCycle
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to end cycle' });
    }
};

export const createCycle = async (req, res) => {
    try {
        const {
            name,
            number,
            status,
            numOfMale,
            numOfFemale,
            startDate,
            expectedEndDate,
            notes
        } = req.body;

        if (
            !name || number == null || !status ||
            numOfMale == null || numOfFemale == null ||
            !startDate || !expectedEndDate
        ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newCycle = new Cycle({
            name,
            number,
            status,
            numOfMale,
            numOfFemale,
            startDate,
            expectedEndDate,
            notes,
        });

        const savedCycle = await newCycle.save();

        // ✅ Create related inventory records with zero price/quantity
        const defaultInventories = [
            { type: 'قش', category: 'outcome' },
            { type: 'علف', category: 'outcome' },
            { type: 'حليب', category: 'outcome' },
            { type: 'موت خرفان', category: 'outcome' },
            { type: 'خرفان مباعة', category: 'income' },
            { type: 'خرفان مربوطة', category: 'income' },
        ];

        const inventoryDocs = defaultInventories.map(item => ({
            cycleId: savedCycle._id,
            type: item.type,
            category: item.category,
            price: 0,
            quantity: 0,
        }));

        await CycleInventory.insertMany(inventoryDocs);

        // ✅ Create end-of-cycle task
        const pasteurellaDate = new Date(startDate);
        pasteurellaDate.setMonth(pasteurellaDate.getMonth() + 6);

        await Task.create({
            title: ` إنهاء الدورة رقم ${number} `,
            dueDate: pasteurellaDate,
            type: 'end-cycle',
            sheepIds: [],
            cycleId: savedCycle._id
        });

        res.status(201).json(savedCycle);
    } catch (err) {
        console.error("Error creating cycle:", err);
        res.status(500).json({ error: "Failed to create cycle" });
    }
};

export const getAllCycles = async (req, res) => {
    try {
        const cycles = await Cycle.find().sort({ startDate: -1 }); // Optional sorting
        res.json(cycles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cycles', error });
    }
};

export const getCycleById = async (req, res) => {
    try {
        const cycle = await Cycle.findById(req.params.id)
            .populate({
                path: 'injectionCases',
                populate: {
                    path: 'injectionType',
                    model: 'StockModel'
                }
            })
            .populate('reports');

        if (!cycle) {
            return res.status(404).json({ error: "Cycle not found" });
        }

        res.status(200).json(cycle);
    } catch (error) {
        console.error("Get Cycle By ID Error:", error);
        res.status(500).json({ error: "Failed to fetch cycle" });
    }
};

export const updateCycle = async (req, res) => {
    try {
        const updatedCycle = await Cycle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCycle) return res.status(404).json({ error: "Cycle not found" });
        res.status(200).json({ message: "Cycle updated", data: updatedCycle });
    } catch (error) {
        console.error("Update Cycle Error:", error);
        res.status(500).json({ error: "فشل تعديل الدورة" });
    }
};

export const deleteCycle = async (req, res) => {
    try {
        const cycleId = req.params.id;

        // Delete the cycle
        const deleted = await Cycle.findByIdAndDelete(cycleId);
        if (!deleted) {
            return res.status(404).json({ error: "Cycle not found" });
        }

        // Debug: Check if tasks exist for this cycle
        const relatedTasks = await Task.find({ cycleId });
        console.log("Found related tasks:", relatedTasks.length);

        // Delete related tasks
        await Task.deleteMany({ cycleId });

        res.status(200).json({ message: "Cycle and related tasks deleted successfully" });
    } catch (error) {
        console.error("Delete Cycle Error:", error);
        res.status(500).json({ error: "Failed to delete cycle" });
    }
};
