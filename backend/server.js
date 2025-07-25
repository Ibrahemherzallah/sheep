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
import milkRoutes from './routes/milk.routes.js';
import stockRoutes from './routes/stock.routes.js';
import protectedRoutes from './routes/protected.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import summaryRoutes from './routes/summary.routes.js';
import path from 'path';
import './scheduler/patientStatusChecker.js';
import { fileURLToPath } from 'url';
const app = express();
const PORT = process.env.PORT || 3030;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({
    origin: ['http://localhost:8080','https://thesheep.top'],
    credentials: true
}));
dotenv.config();
app.use(express.json());
app.use('/api/auth',authRoutes)
app.use('/api/protected', protectedRoutes);
app.use('/api/dashboard',dashboardRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/sheep', sheepRoutes);
app.use('/api/pregnancies', pregnancyRoutes);
app.use('/api/patient', patientRoute);
app.use('/api/supplement', supplementRoute);
app.use('/api/cycle', cycleRoutes);
app.use('/api/injections', injectionsRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/summary', summaryRoutes);

const staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next(); // Skip this handler for API routes
    }
    res.sendFile(path.join(staticPath, 'index.html'));
});
try {
    app.listen(PORT, () => {
        connectMongoDB();
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} catch (err) {
    console.error('Error starting server:', err);
}