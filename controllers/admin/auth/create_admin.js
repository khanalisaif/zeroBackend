// admin/auth/create_admin.js — equivalent of create_admin.php

import { Admin } from '../../../models/Admin.js';
import bcrypt from 'bcrypt';

export async function createAdmin(req, res) {
    try {
        const name     = (req.body.name     || '').trim();
        const mobile   = (req.body.mobile   || req.body.number || '').trim();
        const email    = (req.body.email    || '').trim().toLowerCase();
        const password = (req.body.password || '').trim();

        if (!name || !mobile || !email || !password) {
            return res.status(422).json({ success: false, status: false, message: 'All fields (name, mobile, email, password) are required.' });
        }

        // If admin with this email exists, update credentials and details
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            const hashedPassword = await bcrypt.hash(password, 10);
            existingAdmin.name = name;
            existingAdmin.number = mobile;
            existingAdmin.password = hashedPassword;
            if (req.body.role) existingAdmin.role = req.body.role;
            await existingAdmin.save();

            return res.status(200).json({
                success: true,
                status: true,
                message: 'Admin account updated successfully.',
                admin_id: existingAdmin._id,
                data: {
                    id: existingAdmin._id,
                    name: existingAdmin.name,
                    email: existingAdmin.email,
                    mobile: existingAdmin.number,
                    role: existingAdmin.role
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            number: mobile,
            email,
            password: hashedPassword,
            role: req.body.role || 'admin',
            permissions: req.body.permissions || []
        });

        return res.status(201).json({
            success: true,
            status: true,
            message: 'Admin created successfully.',
            admin_id: newAdmin._id,
            data: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                mobile: newAdmin.number,
                role: newAdmin.role
            }
        });

    } catch (err) {
        return res.status(500).json({ success: false, status: false, message: err.message });
    }
}
