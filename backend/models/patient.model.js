import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    sheepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: true,
    },
    patientName: {
        type: String,
        required: true,
    },
    drugs: [{
        drug: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DrugType',
            required: true
        },
        order: {
            type: Number,
            required: true
        },
    }],
    patientDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        required: false,
    }
},{timestamps: true});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;