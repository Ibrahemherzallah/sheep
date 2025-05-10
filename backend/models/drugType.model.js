import mongoose from 'mongoose';


const drugTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

const DrugType = mongoose.model('DrugType', drugTypeSchema);

export default DrugType;
