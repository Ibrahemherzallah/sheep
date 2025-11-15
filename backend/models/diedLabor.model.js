import mongoose from 'mongoose';

const diedLaborSchema = new mongoose.Schema({
    males: { type: Number, required: true, default: 0 },
    females: { type: Number, required: true, default: 0 },
    notes: { type: String, required: false },
    date: { type: Date, required: true }
},{ timestamps: true });

export default mongoose.model("DiedLabor", diedLaborSchema);
