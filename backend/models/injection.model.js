import mongoose from 'mongoose'
import StockModel from "./stock.model.js";

const injectionSchema = new mongoose.Schema({
    sheepId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: true
    }],
    injectionType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockModel',
    },
    numOfInject: {
        type: Number,
        required: false
    },
    injectDate: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        required: false,
    }

},{timestamps: true});

const InjectionModel = mongoose.model('InjectionModel', injectionSchema);

export default InjectionModel;