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
        const next7Days = new Date(today);

        day10.setDate(today.getDate() + 10);
        day20.setDate(today.getDate() + 20);
        lastMonth.setDate(today.getDate() - 30);
        next7Days.setDate(today.getDate() + 7);

        // 🐑 Sheep Stats
        const totalSheep = await Sheep.countDocuments({});
        const pregnantSheep = await Sheep.countDocuments({ isPregnant: true });
        const patientSheep = await Sheep.countDocuments({ isPatient: true });

        // ➕ Sheep Added Last Month
        const sheepAddedLastMonth = await Sheep.countDocuments({
            createdAt: { $gte: lastMonth, $lte: today },
        });

        const sheepGrowthPercentage = totalSheep > 0
            ? ((sheepAddedLastMonth / totalSheep) * 100).toFixed(2)
            : 0;

        // ♀️ Upcoming Births (Next 7 Days)
        const upcomingPregnancies = await Pregnancy.countDocuments({
            expectedBornDate: { $gte: today, $lte: next7Days },
        });

        // 🔁 Cycle Stats
        const totalCycles = await Cycle.countDocuments({});
        const activeCycles = await Cycle.countDocuments({ status: 'نشطة' });

        // 📋 Task Time Filtering
        const veryRecentTasks = await Task.find({
            dueDate: { $gte: today, $lte: day10 },
        }).sort({ dueDate: 1 });

        const recentTasks = await Task.find({
            dueDate: { $gt: day10, $lte: day20 },
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

export const medicalDashboard = async (req, res) => {
    try {
        const today = new Date();
        const next20Days = new Date();
        const last20Days = new Date();
        const last14Days = new Date();
        const fiveDaysAgo = new Date();

        next20Days.setDate(today.getDate() + 20);
        last20Days.setDate(today.getDate() - 20);
        last14Days.setDate(today.getDate() - 14);
        fiveDaysAgo.setDate(today.getDate() - 5);

        // 1️⃣ Total upcoming injections (from today to next 20 days)
        const upcomingInjections = await Task.countDocuments({
            type: 'injection',
            dueDate: {
                $gte: today,
                $lte: next20Days,
            },
        });

        // 2️⃣ Total patient sheeps
        const totalPatientSheep = await Sheep.countDocuments({ isPatient: true });

        // 3️⃣ Number of distinct used medicine types in last 20 days
        const recentPatients = await Patient.find({
            patientDate: { $gte: last20Days, $lte: today },
        }).populate('drugs.drug');

        const drugIdsSet = new Set();
        for (const patient of recentPatients) {
            for (const entry of patient.drugs) {
                drugIdsSet.add(entry.drug._id.toString());
            }
        }
        const differentMedicineTypesCount = drugIdsSet.size;

        // 4️⃣ Total sheeps that became non-patient in the last 14 days
        // Step 1: Get latest patient records
        const recentPatientRecords = await Patient.aggregate([
            {
                $sort: { updatedAt: -1 },
            },
            {
                $group: {
                    _id: "$sheepId",
                    lastUpdated: { $first: "$updatedAt" },
                },
            },
            {
                $match: {
                    lastUpdated: {
                        $lte: fiveDaysAgo, // must be more than 5 days ago
                        $gte: last14Days, // within last 14 days
                    },
                },
            },
        ]);

        // Step 2: Check if sheep is not patient anymore
        const nonPatientSheepIds = recentPatientRecords.map((r) => r._id);
        const nonPatientCount = await Sheep.countDocuments({
            _id: { $in: nonPatientSheepIds },
            isPatient: false,
        });

        // ✅ Response
        res.json({
            upcomingInjections,
            totalPatientSheep,
            differentMedicineTypesCount,
            nonPatientCount,
        });

    } catch (err) {
        console.error("Error in medical dashboard:", err);
        res.status(500).json({ error: "Server error while fetching medical dashboard" });
    }
};

export const cycleDashboard = async (req, res) => {
    try {
        // 1️⃣ Total cycles & active cycles
        const totalCycles = await Cycle.countDocuments({});
        const activeCycles = await Cycle.countDocuments({ status: "نشطة" }); // adjust keyword if needed

        // 2️⃣ Total number of sheep in all cycles
        const allCycles = await Cycle.find({}, "numOfMale numOfFemale");
        let totalSheepInCycles = 0;
        allCycles.forEach((cycle) => {
            totalSheepInCycles += (cycle.numOfMale || 0) + (cycle.numOfFemale || 0);
        });

        // 3️⃣ & 4️⃣ Feed and Milk stats for last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyReports = await ReportModel.find({
            createdAt: { $gte: oneWeekAgo },
        });

        let totalFeed = 0;
        let totalMilk = 0;

        weeklyReports.forEach((report) => {
            totalFeed += report.numOfFeed || 0;
            totalMilk += report.numOfMilk || 0;
        });

        const feedAvgPerWeek = weeklyReports.length > 0
            ? totalFeed / weeklyReports.length
            : 0;

        // ✅ Response
        res.json({
            totalCycles,
            activeCycles,
            totalSheepInCycles,
            feedAvgPerWeek: Math.round(feedAvgPerWeek * 100) / 100,
            totalMilkPerWeek: totalMilk,
        });
    } catch (err) {
        console.error("Error in cycle dashboard:", err);
        res.status(500).json({ error: "Server error while fetching cycle dashboard" });
    }
};