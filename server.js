import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './models/db.js';

// User routes mapped in apiRoutes.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Base route
app.get('/', (req, res) => {
    res.send('Welcome to zerocommission backend');
});

import apiRouter from './routes/apiRoutes.js';

app.use('/api', apiRouter);
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Connect to Database
    await connectDB();

    // Check Cloudinary Status
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        console.log('Cloudinary Connected Successfully');
    } else {
        console.log('Cloudinary Configuration Missing in .env');
    }
});

export default app;
