import mongoose from 'mongoose';
import InjectionModel from "./injection.model.js";

const cycleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: false,
    },
    expectedEndDate: {
        type: Date,
        required: true,
    },
    numOfMale: {
        type: Number,
        required: true,
    },
    numOfFemale: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    numOfSell: {
        type: Number,
        required: false,
    },
    totalKilos: {
        type: Number,
        required: false,
    },
    priceOfKilo: {
        type: Number,
        required: false,
    },
    numOfDied: {
        type: Number,
        required: false,
    },
    numOfStock: {
        type: Number,
        required: false,
    },
    reports: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ReportModel',
        },
    ],
    injectionCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CycleInjection',
    }],
    notes: {
        type:String,
        required: false,
    },
});

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
