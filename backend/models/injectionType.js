import mongoose form 'mongoose';

const injectionType = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
})

const InjectionType = mongoose.model('InjectionType', injectionType);

export default InjectionType;