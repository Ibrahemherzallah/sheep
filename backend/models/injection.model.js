import mongoose from 'mongoose'

const injectionSchema = new mongoose.Schema({
    sheepId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: true
    }],
    injectionType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InjectionType',
    },
    numOfInject: {
        type: Number,
        required: false
    },
    injectDate: {
        type: Date,
        required: false,
    },
    notes: {
        type: String,
        required: false,
    }

},{timestamps: true});

const InjectionModel = mongoose.model('InjectionModel', injectionSchema);

export default InjectionModel;