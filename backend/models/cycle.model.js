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
    notes: {
        type:String,
        required: false,
    },
    injections: [{
        injection: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InjectionType',
            required: true
        },
        hasRepetition: {
            type: Boolean,
            required: true
        },
        appliedDates: [{
            type: Date
        }]
    }]//in slack details
});

const cycle = mongoose.model('cycle', cycleSchema);

export default cycle;
