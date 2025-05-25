import mongoose from 'mongoose';
import Patient from "./patient.model.js";
import Pregnancy from "./pregnancy.model.js";

const SheepSchema = new mongoose.Schema({
    sheepNumber: {
        type: Number,
        required: true,
        unique: true
    },
    sheepGender: {
        type: String,
        required: true,
        enum: ['ذكر','أنثى']
    },
    source: {
        type: String,
        required: true,
        enum: ['إنتاج المزرعة','شراء']
    },
    isPregnant: {
        type: Boolean,
        required: true,
    },
    pregnantCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pregnancy',
    }],
    patientCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    }],
    isPatient: {
        type: Boolean,
        required: true,
    },
    status: {
        type: String,
        required: false,
        default: '',
    },
    medicalStatus: {
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