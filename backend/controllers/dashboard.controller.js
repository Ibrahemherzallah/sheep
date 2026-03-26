import Sheep from "../models/sheep.model.js";
import Cycle from "../models/cycle.model.js";
import Task from "../models/task.model.js";
import Pregnancy from "../models/pregnancy.model.js";
import Patient from "../models/patient.model.js";
import ReportModel from "../models/report.model.js";

export const dashboard = async (req, res) => {
    try {
        const today = new Date();

        const day10 = new Date(today);
        const day20 = new Date(today);
        const lastMonth = new Date(today);

        day10.setDate(today.getDate() + 10);
        day20.setDate(today.getDate() + 20);
        lastMonth.setDate(today.getDate() - 30);

        // Upcoming pregnancies range: 10 days before today -> 10 days after today
        const pregnancyStart = new Date(today);
        pregnancyStart.setHours(0, 0, 0, 0);
        pregnancyStart.setDate(pregnancyStart.getDate() - 10);

        const pregnancyEnd = new Date(today);
        pregnancyEnd.setHours(23, 59, 59, 999);
        pregnancyEnd.setDate(pregnancyEnd.getDate() + 10);

        // 🐑 Sheep Stats
        const totalSheep = await Sheep.countDocuments({
            status: { $nin: ['مباعة', 'نافقة'] }
        });

        const pregnantSheep = await Sheep.countDocuments({ isPregnant: true });
        const patientSheep = await Sheep.countDocuments({ isPatient: true });

        // ➕ Sheep Added Last Month
        const sheepAddedLastMonth = await Sheep.countDocuments({
            createdAt: { $gte: lastMonth, $lte: today },
        });

        const sheepGrowthPercentage = totalSheep > 0
            ? ((sheepAddedLastMonth / totalSheep) * 100).toFixed(2)
            : 0;

        // ✅ Match the new pregnancy logic exactly
        const upcomingPregnancies = await Pregnancy.countDocuments({
            expectedBornDate: {
                $gte: pregnancyStart,
                $lte: pregnancyEnd
            },
            status: "pregnant"
        });

        // 🔁 Cycle Stats
        const totalCycles = await Cycle.countDocuments({});
        const activeCycles = await Cycle.countDocuments({ status: 'نشطة' });

        // 📋 Task Time Filtering
        const veryRecentTasks = await Task.find({
            dueDate: { $lte: day10 },
            completed: false,
        }).sort({ dueDate: 1 });

        const recentTasks = await Task.find({
            dueDate: { $gt: day10, $lte: day20 },
            completed: false,
        }).sort({ dueDate: 1 });

        // ✅ Final Response
        res.json({
            totalSheep,
            pregnantSheep,
            patientSheep,
            totalCycles,
            activeCycles,
            sheepGrowthPercentage,
            sheepAddedLastMonth,
            upcomingPregnancies,
            veryRecentTasks,
            recentTasks,
        });
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        res.status(500).json({ error: "Server error while fetching dashboard summary" });
    }
};


export const getUpcomingPregnancies = async (req, res) => {
    try {
        // 🔹 Today start (00:00)
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        // 🔹 Go 10 days back
        start.setDate(start.getDate() - 10);

        // 🔹 End date = 10 days after today
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        end.setDate(end.getDate() + 10);

        const pregnancies = await Pregnancy.find({
            expectedBornDate: { $gte: start, $lte: end },
            status: "pregnant"
        }).sort({ expectedBornDate: 1 });

        if (pregnancies.length === 0) {
            return res.json([]);
        }

        const sheepIds = pregnancies.map(p => p.sheepId);

        const sheepList = await Sheep.find({
            _id: { $in: sheepIds },
            isPregnant: true,
        });

        return res.json(sheepList);
    } catch (error) {
        console.error("Error fetching upcoming births:", error);
        return res
            .status(500)
            .json({ error: "Server error while fetching upcoming births" });
    }
};

export const medicalDashboard = async (req, res) => {
    try {
        const today = new Date();
        const day10 = new Date();
        const day20 = new Date();
        const last20Days = new Date();
        const last14Days = new Date();
        const fiveDaysAgo = new Date();

        day10.setDate(today.getDate() + 10);
        day20.setDate(today.getDate() + 20);
        last20Days.setDate(today.getDate() - 20);
        last14Days.setDate(today.getDate() - 14);
        fiveDaysAgo.setDate(today.getDate() - 5);

        // 1️⃣ Total upcoming injections
        const upcomingInjections = await Task.countDocuments({
            type: 'injection',
            dueDate: { $gte: today, $lte: day20 }
        });

        // 2️⃣ Total patient sheep
        const totalPatientSheep = await Sheep.countDocuments({ isPatient: true });

        // 3️⃣ Distinct drug types used in last 20 days
        const recentPatients = await Patient.find({
            patientDate: { $gte: last20Days, $lte: today },
        }).populate("drugs.drug");

        const drugIdsSet = new Set();
        recentPatients.forEach(patient => {
            patient.drugs.forEach(entry => {
                drugIdsSet.add(entry?.drug?._id?.toString());
            });
        });
        const differentMedicineTypesCount = drugIdsSet.size;

        // 4️⃣ Sheep that became non-patient in the last 14 days
        const recentPatientRecords = await Patient.aggregate([
            { $sort: { updatedAt: -1 } },
            {
                $group: {
                    _id: "$sheepId",
                    lastUpdated: { $first: "$updatedAt" }
                }
            },
            {
                $match: {
                    lastUpdated: { $lte: fiveDaysAgo, $gte: last14Days }
                }
            }
        ]);

        const nonPatientSheepIds = recentPatientRecords.map(r => r._id);
        const nonPatientCount = await Sheep.countDocuments({
            _id: { $in: nonPatientSheepIds },
            isPatient: false
        });

        // 5️⃣ Very recent & recent injection tasks
        const veryRecentTasks = await Task.find({
            type: 'injection',
            dueDate: { $lte: day10 },
            completed: false,
        }).sort({ dueDate: 1 });

        const recentTasks = await Task.find({
            type: 'injection',
            dueDate: { $gt: day10, $lte: day20 },
            completed: false
        }).sort({ dueDate: 1 });

        res.json({
            upcomingInjections,
            totalPatientSheep,
            differentMedicineTypesCount,
            nonPatientCount,
            veryRecentTasks,
            recentTasks
        });

    } catch (err) {
        console.error("Error in medical dashboard:", err);
        res.status(500).json({ error: "Server error while fetching medical dashboard" });
    }
};

export const cycleDashboard = async (req, res) => {
    try {
        const today = new Date();
        const day10 = new Date();
        const day20 = new Date();
        const oneWeekAgo = new Date();

        day10.setDate(today.getDate() + 10);
        day20.setDate(today.getDate() + 20);
        oneWeekAgo.setDate(today.getDate() - 7);

        // 1️⃣ Total cycles & active cycles
        const totalCycles = await Cycle.countDocuments({});
        const activeCycles = await Cycle.countDocuments({ status: "نشطة" });

        // 2️⃣ Total sheep in cycles
        const allCycles = await Cycle.find({}, "numOfMale numOfFemale");
        const totalSheepInCycles = allCycles.reduce((sum, cycle) => {
            return sum + (cycle.numOfMale || 0) + (cycle.numOfFemale || 0);
        }, 0);

        // 3️⃣ Feed & Milk stats from reports of last 7 days
        const weeklyReports = await ReportModel.find({
            createdAt: { $gte: oneWeekAgo }
        });

        let totalFeed = 0;
        let totalMilk = 0;
        weeklyReports.forEach(report => {
            totalFeed += report.numOfFeed || 0;
            totalMilk += report.numOfMilk || 0;
        });

        const feedAvgPerWeek = weeklyReports.length > 0
            ? totalFeed / weeklyReports.length
            : 0;

        // 4️⃣ Very recent & recent tasks with cycleId
        const veryRecentTasks = await Task.find({
            cycleId: { $ne: null },
            dueDate: { $lte: day10 },
            completed: false,
        }).sort({ dueDate: 1 });

        const recentTasks = await Task.find({
            cycleId: { $ne: null },
            dueDate: { $gt: day10, $lte: day20 },
            completed: false,
        }).sort({ dueDate: 1 });

        res.json({
            totalCycles,
            activeCycles,
            totalSheepInCycles,
            feedAvgPerWeek: Math.round(feedAvgPerWeek * 100) / 100,
            totalMilkPerWeek: totalMilk,
            veryRecentTasks,
            recentTasks
        });

    } catch (err) {
        console.error("Error in cycle dashboard:", err);
        res.status(500).json({ error: "Server error while fetching cycle dashboard" });
    }
};

