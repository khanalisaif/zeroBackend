import { User } from '../../../models/User.js';
import { Address } from '../../../models/Address.js';

export async function getProfile(req, res) {
    try {
        const user = req.user;
        const addresses = await Address.find({ user_id: user._id }); // assuming Address model has user_id
        
        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully.',
            data: {
                user: {
                    id: user._id,
                    full_name: user.full_name || user.name,
                    phone: user.phone || user.number,
                    phone_number: user.phone || user.number,
                    pan: user.pan || user.pan_number,
                    pan_number: user.pan || user.pan_number,
                    email: user.email,
                    gender: user.gender,
                    profession: user.profession,
                    earning_resource: user.earning_resource,
                    annual_salary: user.annual_salary,
                    annual_turnover: user.annual_turnover,
                    address: user.address,
                    avatar_url: user.avatar_url || user.profile_pic
                },
                addresses: addresses || []
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateProfile(req, res) {
    try {
        const user = req.user;
        const { full_name, name, earning_resource, annual_salary, annual_turnover, profession, gender, email, address } = req.body;
        
        if (full_name || name) user.full_name = full_name || name;
        if (earning_resource) user.earning_resource = earning_resource;
        if (annual_salary) user.annual_salary = annual_salary;
        if (annual_turnover) user.annual_turnover = annual_turnover;
        if (profession) user.profession = profession;
        if (gender) user.gender = gender;
        if (email) user.email = email;
        if (address) user.address = address;
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: { user: { id: user._id, full_name: user.full_name, earning_resource: user.earning_resource } }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateAvatar(req, res) {
    try {
        const user = req.user;
        const { avatar_url } = req.body;
        if (!avatar_url) return res.status(422).json({ success: false, message: 'avatar_url is required' });
        
        user.avatar_url = avatar_url;
        user.profile_pic = avatar_url;
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: 'Avatar updated successfully.',
            data: { avatar_url: user.avatar_url }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
