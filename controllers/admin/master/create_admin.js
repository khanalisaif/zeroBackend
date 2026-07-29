import { Admin } from '../../../models/Admin.js';
import bcrypt from 'bcrypt';

export async function createNewAdmin(req, res) {
    try {
        const name     = (req.body.name || '').trim();
        const email    = (req.body.email || '').trim().toLowerCase();
        const mobile   = (req.body.mobile || req.body.number || '').trim();
        const password = (req.body.password || '').trim();
        const role     = (req.body.role || 'admin').trim();

        if (!name || !email || !password) {
            return res.json({ status: false, message: 'Name, email, and password are required' });
        }

        const allowedEmails = (process.env.MASTER_ADMIN_EMAILS || 'mustafahasan555@gmail.com,hasansaifkhan0@gmail.com')
            .split(',')
            .map(e => e.trim().toLowerCase());

        const emailExists = await Admin.findOne({ email });
        if (emailExists) {
            if (allowedEmails.includes(email)) {
                const hashedPassword = await bcrypt.hash(password, 10);
                emailExists.name = name;
                emailExists.password = hashedPassword;
                emailExists.role = role || 'admin';
                if (mobile) emailExists.number = mobile;
                await emailExists.save();

                return res.json({
                    status: true,
                    message: 'Admin account created successfully!',
                    data: {
                        id: emailExists._id,
                        name: emailExists.name,
                        email: emailExists.email,
                        number: emailExists.number || '',
                        role: emailExists.role
                    }
                });
            }
            return res.json({ status: false, message: 'An Admin with this email already exists' });
        }

        if (mobile) {
            const mobileExists = await Admin.findOne({ number: mobile }).lean();
            if (mobileExists) {
                return res.json({ status: false, message: 'An Admin with this mobile number already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
            message: 'New Admin account created successfully!',
            data: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                number: newAdmin.number || '',
                role: newAdmin.role
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
