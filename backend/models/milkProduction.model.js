import mongoose from 'mongoose'

const milkProductionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    production: {
        type: Number,
        required: true,
    },
    sold: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
},{timestamps: true})

const MilkProduction = mongoose.model('MilkProduction', milkProductionSchema);
export default MilkProduction;