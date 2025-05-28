import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    sheepIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep'
    }],
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cycle',
        required: false,
    },
    dueDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['injection', 'milk', 'pregnancy-check', 'stock-alert', 'born', 'end-cycle'],
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
