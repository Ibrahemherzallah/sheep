import mongoose from 'mongoose';


const cycleInjectionTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    notes: {
        type:String,
        required: false
    }
},{timestamps: true});

const CycleInjectionType = mongoose.model('CycleInjectionType', cycleInjectionTypeSchema);

export default CycleInjectionType;
