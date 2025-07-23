import cron from 'node-cron';
import Patient from '../models/patient.model.js';
import Sheep from '../models/sheep.model.js';
import Task from "../models/task.model.js";
import Inventory from '../models/inventory.model.js';
import Income from '../models/income.model.js';
import Outcome from '../models/outcome.model.js';
// 🕛 Patient status check — runs daily at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Running patient status check...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

        const duePatients = await Patient.find({
            healingDate: { $lte: today }  // Check if healingDate is today or earlier
        });

        for (const patient of duePatients) {
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

cron.schedule('1 5 * * *', async () => {
    console.log('💊 Creating drug tasks for patient sheep...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all sheep marked as patients
        const patientSheep = await Sheep.find({ isPatient: true });

        if (patientSheep.length === 0) {
            console.log('📭 No patient sheep found for today.');
            return;
        }

        for (const sheep of patientSheep) {
            // Get the latest patient case for the sheep
            const patient = await Patient.findOne({ sheepId: sheep._id })
                .sort({ createdAt: -1 }) // Get the latest record
                .populate('drugs.drug'); // Get drug details from StockModel

            let drugNames = '';

            if (patient && patient.drugs.length > 0) {
                drugNames = patient.drugs
                    .sort((a, b) => a.order - b.order)
                    .map(d => `\u200E${d.drug?.name || 'دواء غير معروف'}`)
                    .join(', ');
            } else {
                drugNames = 'لا توجد أدوية مسجلة';
            }
            const sortedDrugs = patient.drugs.sort((a, b) => a.order - b.order);
            const lastDrug = sortedDrugs[sortedDrugs.length - 1];
            const drugName = lastDrug?.drug?.name || 'دواء غير معروف';
            // Create task for this sheep
            const task = new Task({
                title: `يجب إعطاء دواء للنعجة المريض رقم ${sheep.sheepNumber}`,
                sheepIds: [sheep._id],
                dueDate: today,
                type: 'injection',
                completed: false
            });

            await task.save();
        }

        console.log(`✅ Tasks created for ${patientSheep.length} patient sheep.`);

    } catch (error) {
        console.error('❌ Error while creating patient drug tasks:', error);
    }
});

cron.schedule('0 0 1 * *', async () => {
    console.log('📆 Running monthly reset and report generation');

    try {
        const allInventories = await Inventory.find();
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const incomeItems = allInventories.filter(i => i.category === 'income');
        const outcomeItems = allInventories.filter(i => i.category === 'outcome');

        const incomeResources = incomeItems.map(i => ({
            item: i._id,
            price: i.price,
        }));

        const outcomeResources = outcomeItems.map(i => ({
            item: i._id,
            price: i.price,
        }));

        const incomeDoc = new Income({
            month,
            year,
            resources: incomeResources,
            totalCost: incomeResources.reduce((sum, r) => sum + r.price, 0),
        });

        const outcomeDoc = new Outcome({
            month,
            year,
            resources: outcomeResources,
            totalCost: outcomeResources.reduce((sum, r) => sum + r.price, 0),
        });

        await incomeDoc.save();
        await outcomeDoc.save();

        // Reset inventory prices for the new month
        for (const item of allInventories) {
            item.price = 0;
            await item.save();
        }

        console.log('✅ Monthly reset and report generation completed');
    } catch (error) {
        console.error('❌ Monthly reset failed:', error.message);
    }
});