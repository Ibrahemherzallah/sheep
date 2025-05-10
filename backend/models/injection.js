import mongoose from 'mongoose'

const injectionSchema = new mongoose.Schema({
    injectionType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InjectionType',
    },
    numOfInject: {
        type: Number,
        required: true
    },
    injectDate: {
        type: Date,
        required: true,
    }

},{timestamps: true});

const Injection = mongoose.model('Injection', injectionSchema);

export default Injection;