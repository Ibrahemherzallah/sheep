import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cycle',
    },
    startDate: Date,
    endDate: Date,
    numOfFeed: {
        type: Number,
        required: true,
    },
    numOfMilk: {
        type: Number,
        required: true,
    },
    vitamins: [
        {
            vitamin: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'StockModel',
                required: false,
            },
            amount: {
                type: Number,
                required: false,
            },
        },
    ],
    notes: {
        type: String,
        required: false,
    }
},{timestamps: true})


const ReportModel = mongoose.model('ReportModel', reportSchema)
export default ReportModel;