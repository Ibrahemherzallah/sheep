import mongoose from 'mongoose';

const vitaminsSchema = new mongoose.Schema({
    vitaminName: {
        type: String,
        required: true,
    },
    vitaminPrice: {
        type: Number,
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
},{timestamps: true})

const Vitamins = mongoose.model('Vitamins', vitaminsSchema)

export default Vitamins;