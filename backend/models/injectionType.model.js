import mongoose from 'mongoose';

const injectionTypeModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    reputation: {
        type: String,
        required: true,
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
        type: String,
        required: false
    }
},{timestamps: true});

const InjectionType = mongoose.model('InjectionType', injectionTypeModel);

export default InjectionType;