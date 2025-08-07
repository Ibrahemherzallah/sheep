import mongoose from 'mongoose';

const SheepSchema = new mongoose.Schema({
    sheepNumber: {
        type: Number,
        required: true,
    },
    sheepGender: {
        type: String,
        required: true,
        enum: ['ذكر','أنثى']
    },
    source: {
        type: String,
        required: true,
        enum: ['إنتاج المزرعة','شراء']
    },
    isPregnant: {
        type: Boolean,
        required: true,
    },
    pregnantCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pregnancy'
    }],
    patientCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    }],
    pregnantSupplimans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplimant'
    }],
    isPatient: {
        type: Boolean,
        required: true,
    },
    status: {
        type: String,
        required: false,
        default: '',
    },
    medicalStatus: {
        type: String,
        required: true,
    },
    sellPrice: {
        type: Number,
        required: false,
    },
    birthDate: {
        type: Date,
        required: true
    },
    injectionCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockModel',
    }],
    badgeColor: {
        type: String,
        enum: ['أحمر', 'أصفر'], // red, yellow (you can use 'red'/'yellow' if you prefer)
        required: true,
    },
    notes: {
        type: String,
        required: false,
        default: '',
    }
},{timestamps: true});

const Sheep = mongoose.model('Sheep', SheepSchema);

export default Sheep;