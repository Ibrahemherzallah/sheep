import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    patientType: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientType', required: true },
    notes: { type: String },
    drugs: [{
        drug: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug', required: true },
        order: {
            type: Number,
            required: true
        },
    }],
    startDate: {
        type: Date,
        required: true
    },
},{timestamps: true});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;