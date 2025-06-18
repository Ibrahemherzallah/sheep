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

        const result = await Task.deleteMany({
            dueDate: { $lte: tenDaysAgo },
            completed: true, // Only delete if completed
        });

        console.log(`🗑️ ${result.deletedCount} completed tasks older than 10 days deleted.`);
    } catch (error) {
        console.error('❌ Error during task cleanup:', error);
    }
});

// 🐄 Milk task creation — runs daily at 5 AM
cron.schedule('0 5 * * *', async () => {
    console.log('📝 Creating daily milk task...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newTask = new Task({
            title: 'تسجيل كمية الحليب',
            description: 'يرجى تسجيل كمية الحليب لهذا اليوم',
            dueDate: today,
            type: 'milk',
            completed: false
        });

        await newTask.save();

        console.log('✅ Daily milk task created successfully');
    } catch (error) {
        console.error('❌ Error while creating milk task:', error);
    }
});