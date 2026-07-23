// admin/auth/create_admin.js — equivalent of create_admin.php

import { Admin } from '../../../models/Admin.js';
import bcrypt from 'bcrypt';

export async function createAdmin(req, res) {
    try {
        const name     = (req.body.name     || '').trim();
        const mobile   = (req.body.mobile   || '').trim();
        const email    = (req.body.email    || '').trim();
        const password = (req.body.password || '').trim();

        if (!name || !mobile || !email || !password) {
            return res.json({ status: false, message: 'All fields are required' });
        }

        // Check email exists
        const emailRows = await Admin.findOne({ email }).lean();
        if (emailRows) {
            return res.json({ status: false, message: 'Email already exists' });
        }

        // Check mobile exists
        const mobileRows = await Admin.findOne({ number: mobile }).lean();
        if (mobileRows) {
            return res.json({ status: false, message: 'Mobile already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            number: mobile,
            email,
            password: hashedPassword
        });

        return res.json({
            status: true,
            message: 'Admin created successfully',
            admin_id: newAdmin._id
        });

    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}
