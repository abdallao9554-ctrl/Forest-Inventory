import express from 'express';
import cors from 'cors';
import inventoryRoutes from './routes/inventory';
import permitRoutes from './routes/permits';
import authRoutes from './routes/auth';
import monitoringRoutes from './routes/monitoring';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Forest Inventory API is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/monitoring', monitoringRoutes);

export default app;
