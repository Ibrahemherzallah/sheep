import mongoose from 'mongoose';
import Patient from "./patient.model";
import InjectionModel from "./injection.model.js";
import Pregnancy from "./pregnancy.model.js";

const SheepSchema = new mongoose.Schema({
    sheepNumber: {
        type: Number,
        required: true,
    },
    sheepGender: {
        type: String,
        required: true,
        enum: ['ذكر','انثى']
    },
    source: {
        type: String,
        required: true,
        enum: ['انتاج','شراء']
    },
    isPregnant: {
        type: Boolean,
        required: true,
    },
    pregnantCases: [
        Pregnancy
    ],
    isPatient: {
        type: Boolean,
        required: true,
    },
    patientCases: [
        Patient
    ],
    status: {
        type: String,
        required: true,
    },
    sellPrice: {
        type: Number,
        required: false,
    },
    injectionCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InjectionModel',
    }],
    notes: {
        type: String,
        required: false,
        default: '',
    }

},{timestamps: true});

const Sheep = mongoose.model('Sheep', SheepSchema);

export default Sheep;