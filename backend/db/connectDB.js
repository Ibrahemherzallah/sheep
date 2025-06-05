import mongoose from 'mongoose'

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully.');
    } catch (error) {
        console.log("Error connecting to MongoDB" , error.message);
    }
}

export default connectMongoDB;