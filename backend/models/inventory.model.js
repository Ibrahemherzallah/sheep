import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['income', 'outcome'],
    }
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);
