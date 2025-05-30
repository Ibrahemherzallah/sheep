import cron from 'node-cron';
import Patient from '../models/patient.model.js';
import Sheep from '../models/sheep.model.js';
import Task from "../models/task.model.js";

// 🕛 Patient status check — runs daily at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Running patient status check...');

    try {
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        const outdatedPatients = await Patient.find({
            updatedAt: { $lte: fiveDaysAgo }
        });

        for (const patient of outdatedPatients) {
            const sheep = await Sheep.findById(patient.sheepId);

            if (sheep && sheep.isPatient === true) {
                sheep.isPatient = false;
                sheep.medicalStatus = 'سليمة';
                await sheep.save();
                console.log(`✅ Sheep ${sheep.sheepNumber} marked as سليم`);
            }
        }

    } catch (error) {
        console.error('❌ Error in patient status checker:', error);
    }
});

// 🧹 Task cleanup — runs daily at 1 AM
cron.schedule('0 1 * * *', async () => {
    console.log('🧹 Running task cleanup...');

    try {
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        const result = await Task.deleteMany({ dueDate: { $lte: tenDaysAgo } });

        console.log(`🗑️ ${result.deletedCount} old tasks deleted.`);
    } catch (error) {
        console.error('❌ Error during task cleanup:', error);
    }
});
