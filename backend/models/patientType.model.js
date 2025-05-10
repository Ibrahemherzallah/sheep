import mongoose from 'mongoose';

const patientTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

const PatientType = mongoose.model('PatientType', patientTypeSchema);

export default PatientType;