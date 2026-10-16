import { Admin } from '../../../models/Admin.js';
import bcrypt from 'bcrypt';

export async function createNewAdmin(req, res) {
    try {
        const name     = (req.body.name || '').trim();
        const email    = (req.body.email || '').trim().toLowerCase();
        const mobile   = (req.body.mobile || req.body.number || '').trim();
        const password = (req.body.password || '').trim();
        const role     = (req.body.role || 'admin').trim();

        if (!name || !email) {
            return res.json({ status: false, success: false, message: 'Name and email are required' });
        }

        const adminPassword = password || 'Admin@123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const emailExists = await Admin.findOne({ email });
        if (emailExists) {
            emailExists.name = name;
            emailExists.password = hashedPassword;
            emailExists.role = role || emailExists.role || 'admin';
            if (mobile) emailExists.number = mobile;
            await emailExists.save();

            return res.json({
                status: true,
                success: true,
                message: 'Admin account updated successfully!',
                data: {
                    id: emailExists._id,
                    name: emailExists.name,
                    email: emailExists.email,
                    number: emailExists.number || '',
                    mobile: emailExists.number || '',
                    role: emailExists.role,
                    default_password: password ? undefined : 'Admin@123'
                }
            });
        }

        if (mobile) {
            const mobileExists = await Admin.findOne({ number: mobile, email: { $ne: email } }).lean();
            if (mobileExists) {
                return res.json({ status: false, success: false, message: 'An Admin with this mobile number already exists' });
            }
        }

        const adminData = {
            name,
            email,
            password: hashedPassword,
            role: role || 'admin'
        };

        if (mobile) {
            adminData.number = mobile;
        }

        const newAdmin = await Admin.create(adminData);

        return res.json({
            status: true,
            success: true,
            message: 'New Admin account created successfully!',
            data: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                number: newAdmin.number || '',
                mobile: newAdmin.number || '',
                role: newAdmin.role,
                default_password: password ? undefined : 'Admin@123'
            }
        });
    } catch (err) {
        console.error('createNewAdmin error:', err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'email or mobile number';
            return res.json({ status: false, message: `An Admin with this ${field} already exists.` });
        }
        return res.json({ status: false, message: err.message || 'Server error creating admin account' });
    }
}
