import { User } from './User.js';

export async function createUser(mobile, email) {
    let user = await User.findOne({ email }).lean();
    if (user) {
        return {
            status: true,
            is_new_user: false,
            message: 'User already exists',
            user_id: user._id
        };
    }

    const newUser = await User.create({ number: mobile, email });
    return {
        status: true,
        is_new_user: true,
        message: 'New user created successfully',
        user_id: newUser._id
    };
}
