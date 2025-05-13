import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
    cycleId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cycle',
    },
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
        required: false,
    },
    numOfFeed: {
        type: Number,
        required: true,
    },
    numOfMilk: {
        type: Number,
        required: true,
    },
    vitamins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vitamins',
    }]
},{timestamps: true})


const ReportModel = mongoose.model('ReportModel', reportSchema)
export default ReportModel;