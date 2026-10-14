// Module 2.2 — POST /api/auth/verify-registration
// Validates hashed OTP, promotes pending record to users table, returns Bearer token

import { User } from '../../../models/User.js';
import { PendingRegistration } from '../../../models/PendingRegistration.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';

export async function verifyRegistration(req, res) {
    try {
        const { phone, otp } = req.body;

        // Validate required fields
        if (!phone || !otp) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: { field: 'phone and otp are required.' }
            });
        }

        // Find pending registration
        const pending = await PendingRegistration.findOne({ phone });
        if (!pending) {
            return res.status(404).json({
                success: false,
                message: 'No pending registration found for this phone number.'
            });
        }

        // Check OTP expiry
        if (pending.expires_at < new Date()) {
            await PendingRegistration.deleteMany({ phone });
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: { otp: 'OTP has expired. Please register again.' }
            });
        }

        // Verify OTP using bcrypt compare (Bug 3 fix: OTP was stored as hash)
        const isOtpValid = await bcrypt.compare(otp, pending.otp);
        if (!isOtpValid) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: { otp: 'Invalid OTP. Please check and try again.' }
            });
        }

        // Promote pending registration to users table
        const newUser = new User({
            first_name: pending.full_name,
            name: pending.full_name,
            full_name: pending.full_name,
            phone: pending.phone,
            number: pending.phone,
            email: pending.email || null,
            pan: pending.pan,
            pan_number: pending.pan,
            earning_resource: pending.earning_resource,
            annual_salary: pending.annual_salary,
            annual_turnover: pending.annual_turnover,
            profile_image: pending.profile_image || null,
            password: pending.password, // already hashed from register step
            access_token: crypto.randomBytes(32).toString('hex')
        });

        await newUser.save();

        // Clean up pending registration
        await PendingRegistration.deleteMany({ phone });

        // Send welcome email if email provided
        if (newUser.email) {
            sendTemplateMail(newUser.email, 'welcome_user', { name: newUser.full_name })
                .catch(err => console.error('Welcome email failed:', err));
        }

        return res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: {
                token: newUser.access_token,
                user: {
                    id: newUser._id,
                    full_name: newUser.full_name,
                    phone: newUser.phone,
                    pan: newUser.pan,
                    earning_resource: newUser.earning_resource,
                    annual_salary: newUser.annual_salary,
                    annual_turnover: newUser.annual_turnover,
                    avatar_url: newUser.avatar_url || null,
                    delete_account_status: false,
                    delete_account_days_left: 0
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
