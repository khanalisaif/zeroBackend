import { User } from './User.js';
import bcrypt from 'bcrypt';

export async function createUser(mobile, email, name, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanMobile = (mobile || '').trim();

    if (cleanEmail) {
        const existingEmail = await User.findOne({ 
            email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } 
        }).lean();
        if (existingEmail) {
            return {
                status: false,
                is_new_user: false,
                message: 'This email address is already registered. Please log in or use a different email.',
                user_id: existingEmail._id
            };
        }
    }

    if (cleanMobile) {
        const existingMobile = await User.findOne({ number: cleanMobile }).lean();
        if (existingMobile) {
            return {
                status: false,
                is_new_user: false,
                message: 'This mobile number is already registered. Please log in or use a different number.',
                user_id: existingMobile._id
            };
        }
    }

    let hashedPassword = '';
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser = await User.create({ number: cleanMobile, email: cleanEmail, name, password: hashedPassword });
    return {
        status: true,
        is_new_user: true,
        message: 'New user created successfully',
        user_id: newUser._id
    };
}
