import mongoose from 'mongoose';

const outcomeSchema = new mongoose.Schema({
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    resources: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
    }],
    totalCost: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

export default mongoose.model('Outcome', outcomeSchema);
