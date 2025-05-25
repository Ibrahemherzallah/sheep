import mongoose from 'mongoose';


const drugTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    patientTakeFor: {
        type: String,
        required: true,
    },
    notes: {
        type:String,
        required: false
    }
},{timestamps: true});

const DrugType = mongoose.model('DrugType', drugTypeSchema);

export default DrugType;
