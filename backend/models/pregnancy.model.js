import mongoose from 'mongoose';
import {createBirthRelatedTasks} from "../services/taskService.js";

const pregnancySchema = new mongoose.Schema({
    sheepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: true,
    },
    pregnantDate: {
        type: Date,
        required: true,
    },
    bornDate: {
        type: Date,
        required: false,
    },
    expectedBornDate: {
        type: Date,
        required: true,
    },
    numberOfMaleLamb: {
        type: Number,
        required: false,
        default: 0,
    },
    numberOfFemaleLamb: {
        type: Number,
        required: false,
        default: 0,
    },
    milkAmount: {
        type: Number,
        required: false,
        default: 0,
    },
    startMilkDate: {
        type: Date,
        required: false,
    },
    milkNotes: {
        type: String,
        required: false
    },
    endMilkDate: {
        type: Date,
        required: false,
    },
    order: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: false
    }
    
},{timestamps: true});


const Pregnancy = mongoose.model('Pregnancy', pregnancySchema);

export default Pregnancy;
