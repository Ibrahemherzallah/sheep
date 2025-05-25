import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectMongoDB from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import taskRoutes from './routes/tasks.routes.js';
import sheepRoutes from './routes/sheep.routes.js';
import pregnancyRoutes from './routes/pregnancy.routes.js';
import patientRoute from './routes/patient.routes.js';
import supplementRoute from './routes/supplies.routes.js';
import cycleRoutes from './routes/cycle.routes.js';
import injectionsRoutes from './routes/injection.routes.js';
import './scheduler/patientStatusChecker.js';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
dotenv.config();

app.use(express.json());

app.use('/api/auth',authRoutes)
app.use('/api/dashboard',dashboardRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/sheep', sheepRoutes);
app.use('/api/pregnancies', pregnancyRoutes);
app.use('/api/patient', patientRoute);
app.use('/api/supplement', supplementRoute);
app.use('/api/cycle', cycleRoutes);
app.use('/api/injections', injectionsRoutes);



app.listen(PORT , ()=> {
    connectMongoDB()
    console.log(`Server is running on http://localhost:${PORT}`);
});