import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './models/db.js';

// Admin Auth Routes
import adminAuthRouter from './routes/admin/authRoutes.js';

// Admin Feature Routes
import adminFeatureRouter from './routes/admin/featureRoutes.js';

// User Auth Routes
import userAuthRouter from './routes/user/authRoutes.js';

// User Feature Routes
import userFeatureRouter from './routes/user/featureRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin routes
app.use('/admin/auth', adminAuthRouter);
app.use('/admin/feature', adminFeatureRouter);

// User routes
app.use('/user/auth', userAuthRouter);
app.use('/user/feature', userFeatureRouter);

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
