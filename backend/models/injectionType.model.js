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
    notes: {
        type: String,
        required: false
    }
})

const InjectionType = mongoose.model('InjectionType', injectionTypeModel);

export default InjectionType;