import mongoose from 'mongoose';
import Patient from "./patient.model";

const SheepSchema = new mongoose.Schema({
    sheepNumber: {
        type: Number,
        required: true,
    },
    sheepGender: {
        type: String,
        required: true,
    },
    isPregnant: {
        type: Boolean,
        required: true,
    },
    pregnantCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pregnant',
    }],
    patientCases: [Patient],
    injectionCases: [{

    }],
    notes: {
        type: String,
        required: false,
        default: '',
    }

},{timestamps: true});

const Sheep = mongoose.model('Sheep', SheepSchema);

export default Sheep;