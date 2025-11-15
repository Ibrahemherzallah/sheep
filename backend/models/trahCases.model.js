import mongoose from 'mongoose';

const TrahCaseSchema = new mongoose.Schema({
    sheepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: true
    },
    trahDate: {
        type: Date,
        required: true
    },
    numberOfMaleLamb: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfFemaleLamb: {
        type: Number,
        required: true,
        default: 0
    },
    order: {
        type: Number,
        required: false
    },
    notes: {
        type: String,
        default: ''
    },
}, { timestamps: true });

const TrahCase = mongoose.model('TrahCase', TrahCaseSchema);
export default TrahCase;
