import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Medicine', 'Injection','Vitamins','Feed','Straw'],
    },
    name: {
        type: String,
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
        type:String,
        required: false,
    }
},{ timestamps: true })

const StockModel = mongoose.model('StockModel', stockSchema)
export default StockModel;