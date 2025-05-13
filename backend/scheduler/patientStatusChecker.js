import cron from 'node-cron';
import Patient from '../models/patient.model.js';
import Sheep from '../models/sheep.model.js';

// Runs daily at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Running patient status check...');

    try {
        // Get patient cases older than 5 days
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        const outdatedPatients = await Patient.find({
            updatedAt: { $lte: fiveDaysAgo }
        });

        for (const patient of outdatedPatients) {
            const sheep = await Sheep.findById(patient.sheepId);

            // Only update if still marked as patient
            if (sheep && sheep.isPatient === true) {
                sheep.isPatient = false;
                sheep.status = 'سليم';
                await sheep.save();
                console.log(`✅ Sheep ${sheep.sheepNumber} marked as سليم`);
            }
        }

    } catch (error) {
        console.error('❌ Error in patient status checker:', error);
    }
});
