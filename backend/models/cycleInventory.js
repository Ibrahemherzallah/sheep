import mongoose from 'mongoose';

const cycleInventorySchema = new mongoose.Schema({
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cycle',
    },
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

export default mongoose.model('CycleInventory', cycleInventorySchema);
