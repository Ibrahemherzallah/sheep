import mongoose from 'mongoose'

const PregnantSupplimant = new mongoose.Schema({
    sheepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: true
    },
    numOfIsfenjeh: {
        type: Number,
        required: true,
        default: 0
    },
    numOfHermon: {
        type: Number,
        required: true,
        default: 0
    }
},{timestamps: true})

const Supplimant = mongoose.model("Supplimant", PregnantSupplimant);
export default Supplimant;