import mongoose from 'mongoose';


const cycleInjectionSchema = new mongoose.Schema({
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cycle',
    },
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

const CycleInjection = mongoose.model('CycleInjection', cycleInjectionSchema);

export default CycleInjection;
