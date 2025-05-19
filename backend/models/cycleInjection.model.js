import mongoose from 'mongoose';


const cycleInjectionSchema = new mongoose.Schema({
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cycle',
    },
    injections: [{
        inject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CycleInjectionType'
        },
        isTaken: {
            type: Boolean,
            required: true
        },
    }]

},{timestamps: true});

const CycleInjection = mongoose.model('CycleInjection', cycleInjectionSchema);

export default CycleInjection;
