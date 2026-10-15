// Module 2.1 — POST /api/auth/register
// Stores pending registration with hashed OTP and sends OTP via email/SMS

import { User } from '../../../models/User.js';
import { PendingRegistration } from '../../../models/PendingRegistration.js';
import bcrypt from 'bcrypt';
import { sendTemplateMail } from '../../../services/email/mail_helper.js';
import { sendOtpSms } from '../../../services/sms/smsService.js';

export async function createUser(req, res) {
    try {
        const { full_name, name, phone, pan, email, earning_resource, annual_salary, annual_turnover, password, profile_image } = req.body;
        const finalName = full_name || name;

        // Validate required fields
        if (!finalName || !phone || !pan) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: { field: 'full_name, phone, and pan are required.' }
            });
        }

        // Check PAN format: [A-Z]{5}[0-9]{4}[A-Z]{1}
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(pan.toUpperCase())) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: { pan: 'Invalid PAN format. Expected format: ABCDE1234F' }
            });
        }

        // Check if phone already registered
        const existingUser = await User.findOne({ $or: [{ phone }, { number: phone }] });
        if (existingUser) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed.',
                errors: { phone: 'This phone number is already registered.' }
            });
        }

        // Generate 4-digit OTP and hash it (Bug 3 fix: OTP hashed with bcrypt)
        const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedOtp = await bcrypt.hash(rawOtp, 10);

        // Hash password (auto-generate 6-digit if not provided)
        const rawPassword = password || Math.floor(100000 + Math.random() * 900000).toString();
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        // Clear any old pending registration for this phone
        await PendingRegistration.deleteMany({ phone });

        // Save pending registration with hashed OTP
        const pending = new PendingRegistration({
            full_name: finalName,
            phone,
            pan: pan.toUpperCase(),
            email: email || null,
            earning_resource: earning_resource || 'Employed',
            annual_salary: annual_salary || '₹ 8,00,000',
            annual_turnover: annual_turnover || '₹ 0',
            profile_image: profile_image || null,
            password: passwordHash,
            otp: hashedOtp,
            expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });
        await pending.save();

        // Send OTP via email if email provided
        if (email) {
            sendTemplateMail(email, 'user_login_otp', { otp: rawOtp })
                .catch(err => console.error('Register OTP email failed:', err));
        }

        // Send OTP via SMS (PRP SMS — SignUp_OTP template)
        sendOtpSms(phone, rawOtp, 'signup')
            .catch(err => console.error('Register OTP SMS failed:', err));

        // Log OTP in dev mode only (remove in production)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Register OTP for ${phone}: ${rawOtp}`);
        }

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                phone,
                expires_in: 300,
                sms_sent: true,
                password_sms_sent: !password // true if password was auto-generated
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
