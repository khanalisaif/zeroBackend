import mongoose from 'mongoose';
import 'dotenv/config';

let isConnected = false;

export async function connectDB() {
    if (isConnected) {
        return mongoose.connection;
    }

    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zerocommission';
        
        await mongoose.connect(uri);

        isConnected = true;
        console.log('Database Connected Successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
        process.exit(1);
    }
}

// Automatically connect when imported
connectDB();
