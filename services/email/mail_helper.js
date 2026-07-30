// mail_helper.js — equivalent of mail_helper.php
// Central function for sending templated emails

import fs from 'fs';
import { MailManager } from './MailManager.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logoPath = path.join(__dirname, 'assets', 'logo.png');
// Use cid:companylogo so mail clients render the inline attached logo natively without blocking base64
const logo = 'cid:companylogo';

/**
 * Email asset URL helper
 */
export function emailAsset(file) {
    const base = process.env.EMAIL_ASSET_URL || 'https://zerocommissionloan.com/';
    return base + file.replace(/^\//, '');
}

/**
 * Auth signature HTML block
 */
function getAuthSignature() {
    
    return `
        <tr>
            <td style="padding:20px 40px 15px 40px;">
                <b>
                <p style="margin:0;color:#111827; font-size:17px; font-weight:600;">
                    Warm Regards,
                </p></b>
                <br>
                <br>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <!-- Logo -->
                    <td width="120" valign="top">
                        <img
                            src="${logo}"
                            alt="Zero Commission"
                            style="display:block;width:100px;height:auto;">
                    </td>
                    <td width="20"></td>
                    <!-- Vertical Line -->
                    <td width="1" bgcolor="#d1d5db"></td>
                    <td width="20"></td>
                    <!-- Details -->
                    <td valign="top">
                        <div style="
                            font-size:18px;
                            font-weight:700;
                            color:#001B5E;
                            margin-bottom:12px;">
                            Authentication Team
                        </div>
                        <div style="
                            font-size:13px;
                            color:#374151;
                            line-height:1.6;">
                            ✉ ZeroCommission@digivahan.in
                            <br>
                            📍 Unit No. 309, 3rd Floor, Tower-A<br>
                            SAS Tower, Medicity, Sector-38<br>
                            Gurgaon 122001
                        </div>
                    </td>
                </tr>
            </table>
            </td>
        </tr>
    `;
}

/**
 * Header HTML block
 */
function getHeader() {
    return ``;
}

function getFooter() {
    return `
        <tr>
            <td align="center"
                style="padding:20px;border-top:1px solid #e5e7eb;background:#fafafa;">
                <p style="margin:0;font-size:14px;color:#6b7280;">
                    Transparent Loans. Zero Commission. Maximum Savings.
                </p>
                <p style="margin-top:10px;font-size:12px;color:#9ca3af;">
                    © Zero Commission. All Rights Reserved.
                </p>
            </td>
        </tr>
    `;
}

/**
 * Email templates registry — equivalent of PHP template files
 */
function getTemplate(templateName, data) {
    
    const sig = getAuthSignature();
    const footer = getFooter();
    const header = getHeader();

    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    switch (templateName) {

        case 'master_admin_login_otp': {
            const otp = data.otp || '';
            return {
                subject: 'Master Admin Portal Verification — Zero Commission',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;">Master Admin Portal Verification</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Master Admin,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely authenticate into the Master Admin Portal, please use the verification code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#0057FF;color:#ffffff;display:inline-block;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p style="font-size:15px;color:#4b5563;">Never share this OTP with anyone.</p>
                        <p style="font-size:15px;color:#4b5563;">If you did not request this verification code, please ignore this email.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'admin_login_otp': {
            const otp = data.otp || '';
            return {
                subject: 'Admin Portal Login Verification — Zero Commission',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;">Admin Portal Verification</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Administrator,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely access your Admin Portal dashboard, please use the verification code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#0057FF;color:#ffffff;display:inline-block;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p style="font-size:15px;color:#4b5563;">Never share this OTP with anyone.</p>
                        <p style="font-size:15px;color:#4b5563;">If you did not request this verification code, please ignore this email.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'admin_login_alert': {
            return {
                subject: 'Admin Login Detected',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#1f2937;text-align:center;">Login Alert</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Admin,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Your account was accessed using a valid login credential.</p>
                        <div style="background:#f3f4f6;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Login Time:</strong> ${now}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If this login was performed by you, no further action is required.</p>
                        <p style="font-size:15px;color:#dc2626;line-height:1.7;">If you do not recognize this activity, please secure your account immediately and contact support.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'logout_notification': {
            return {
                subject: 'Account Logout Notification',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#1f2937;text-align:center;">Logout Confirmation</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Your account has been successfully logged out.</p>
                        <div style="background:#f3f4f6;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Logout Time:</strong> ${now}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If this logout action was performed by you, no further action is required.</p>
                        <p style="font-size:15px;color:#dc2626;line-height:1.7;">If you do not recognize this activity, please contact our support team immediately.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'user_logout_notification': {
            return {
                subject: 'Account Logout Notification',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#1f2937;text-align:center;">Logout Confirmation</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Your account has been successfully logged out.</p>
                        <div style="background:#f3f4f6;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Logout Time:</strong> ${now}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If this logout action was performed by you, no further action is required.</p>
                        <p style="font-size:15px;color:#dc2626;line-height:1.7;">If you do not recognize this activity, please contact our support team immediately.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'user_login_otp': {
            const otp = data.otp || '';
            return {
                subject: 'User Account Login Verification — Zero Commission',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;">Account Login Verification</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely access your Zero Commission dashboard and account, please use the verification code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#0057FF;color:#ffffff;display:inline-block;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p style="font-size:15px;color:#4b5563;">Never share this OTP with anyone.</p>
                        <p style="font-size:15px;color:#4b5563;">If you did not request this verification code, please ignore this email.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'track_application_otp': {
            const otp = data.otp || '';
            return {
                subject: 'Loan Application Tracking Verification — Zero Commission',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;">Loan Application Verification</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely access and track your loan application status, please use the verification code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#0057FF;color:#ffffff;display:inline-block;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p style="font-size:15px;color:#4b5563;">Never share this OTP with anyone.</p>
                        <p style="font-size:15px;color:#4b5563;">If you did not request this verification code, please ignore this email.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'track_consultation_otp': {
            const otp = data.otp || '';
            return {
                subject: 'Consultation Ticket Tracking Verification — Zero Commission',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;">Consultation Ticket Verification</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely access and track your consultation ticket and advisor messages, please use the verification code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#0057FF;color:#ffffff;display:inline-block;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p style="font-size:15px;color:#4b5563;">Never share this OTP with anyone.</p>
                        <p style="font-size:15px;color:#4b5563;">If you did not request this verification code, please ignore this email.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'forgot_password_otp': {
            const otp = data.otp || '';
            return {
                subject: 'Password Reset Verification Code — Zero Commission',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;">Password Reset Verification</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">We received a request to reset your account password. To securely reset your password, please use the verification code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#0057FF;color:#ffffff;display:inline-block;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p style="font-size:15px;color:#4b5563;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'user_login_alert': {
            return {
                subject: 'New Login Detected',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#1f2937;text-align:center;">Login Alert</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Your account was successfully accessed using a valid login credential.</p>
                        <div style="background:#f3f4f6;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Login Time:</strong> ${now}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If this login was performed by you, no further action is required.</p>
                        <p style="font-size:15px;color:#dc2626;line-height:1.7;">If you do not recognize this activity, please secure your account immediately and contact support.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'application_submitted': {
            const applicationToken = data.application_token || '';
            return {
                subject: 'Your Loan Application Has Been Successfully Submitted',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Thank you for choosing Zero Commission.</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Your loan application has been submitted successfully and is currently under review.</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:10px 40px 30px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
                            <tr>
                                <td style="padding:20px;">
                                    <p style="margin:0;color:#6b7280;font-size:13px;">Application Token</p>
                                    <p style="margin:8px 0 0 0;font-size:18px;font-weight:bold;color:#0057FF;word-break:break-all;">${applicationToken}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">Please save your Application Token for future reference.</p>
                        <p style="font-size:15px;color:#4b5563;">You can use these details to track your loan application status.</p>
                        <p style="font-size:15px;color:#4b5563;">Our verification team will contact you shortly.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'loan_status_update': {
            const applicationToken = data.application_token || '';
            const status = data.status || 'Updated';
            const remarks = (data.remarks || '').trim();
            const remarksHtml = remarks ? `
        <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:18px;margin:20px 0;border-radius:8px;">
            <p style="margin:0 0 10px 0;font-size:15px;font-weight:bold;color:#92400e;">Notes</p>
            <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">${remarks}</p>
        </div>` : '';
            return {
                subject: `Loan Application Status Updated - ${status}`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr><td style="padding:40px;">
<h2 style="color:#1f2937;text-align:center;">Loan Application Status Update</h2>
<p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
<p style="font-size:16px;color:#4b5563;line-height:1.7;">We would like to inform you that your loan application is currently in the <strong style="color:#0057FF;">${status}</strong> stage.</p>
<div style="background:#eff6ff;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
    <p style="margin:0 0 10px 0;font-size:15px;color:#374151;"><strong>Application Reference:</strong> ${applicationToken}</p>
    <p style="margin:0;font-size:15px;color:#374151;"><strong>Current Status:</strong> ${status}</p>
</div>
${remarksHtml}
<p style="font-size:15px;color:#4b5563;line-height:1.8;">Please log in to your account for more details regarding your application.</p>
<p style="font-size:15px;color:#4b5563;line-height:1.8;">If you have any questions, our support team will be happy to assist you.</p>
</td></tr>
${sig}
${footer}
</table>
</td></tr>
</table>
</div>`
            };
        }

        case 'loan_document_status': {
            const applicationToken = data.applicationToken || '';
            const documentStatus = (data.document_status || '').toLowerCase();
            const remarks = (data.remarks || '').trim();
            const remarksHtml = remarks ? `
        <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:18px;margin:20px 0;border-radius:8px;">
            <p style="margin:0 0 10px 0;font-size:15px;font-weight:bold;color:#92400e;">Notes</p>
            <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">${remarks}</p>
        </div>` : '';
            const capStatus = documentStatus.replace(/\b\w/g, c => c.toUpperCase());
            return {
                subject: `Document - ${capStatus}`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr><td style="padding:40px;">
<h2 style="color:#1f2937;text-align:center;">Document Verification Update</h2>
<p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
<p style="font-size:16px;color:#4b5563;line-height:1.7;">We would like to inform you that the documents submitted for your loan application have been <strong style="color:#0057FF;">${documentStatus}</strong>.</p>
<div style="background:#eff6ff;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
    <p style="margin:0;font-size:15px;color:#374151;"><strong>Application Reference:</strong> ${applicationToken}</p>
    <p style="margin:12px 0 0 0;font-size:15px;color:#374151;"><strong>Document Status:</strong> ${documentStatus}</p>
</div>
${remarksHtml}
<p style="font-size:15px;color:#4b5563;line-height:1.8;">Please log in to your account for more details regarding your application.</p>
<p style="font-size:15px;color:#4b5563;line-height:1.8;">If you have any questions, our support team will be happy to assist you.</p>
</td></tr>
${sig}
${footer}
</table>
</td></tr>
</table>
</div>`
            };
        }

        case 'loan_application_deleted': {
            const applicationToken = data.application_token || '';
            return {
                subject: 'Loan Application Request Closed',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#dc2626;text-align:center;">Loan Application Closed</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">We would like to inform you that your loan application request has been closed and removed from our active processing queue.</p>
                        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Application Reference:</strong> ${applicationToken}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.8;">This action may have been taken due to incomplete information, missing documentation, duplicate submissions, or other verification-related requirements.</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.8;">If you still wish to apply for a loan, you may submit a new application through our platform at any time.</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.8;">For any questions or assistance, please feel free to contact our support team.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'loan_application_under_review': {
            const applicationToken = data.application_token || '';
            return {
                subject: 'Your Loan Application Is Under Review',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#1f2937;text-align:center;">Loan Application Under Review</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Thank you for submitting your loan application with Zero Commission.</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">We would like to inform you that your application is currently under review by our verification and processing team.</p>
                        <div style="background:#f3f4f6;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Application Reference:</strong> ${applicationToken}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.8;">Our team is carefully reviewing the details and documents provided by you to ensure a smooth and accurate loan approval process.</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.8;">We appreciate your patience and assure you that our team is dedicatedly working on your application. You will be notified as soon as there is any update regarding your loan status.</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.8;">No action is required from your side at this moment.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'Send_document_sumbition': {
            const applicationToken = data.application_token || '';
            const documentListHtml = data.documentListHtml || '';
            return {
                subject: 'Your Documents Have Been Uploaded Successfully',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Customer,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Thank you for uploading your documents.</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">We have successfully received your loan application documents.</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px;">
                        <div style="background:#ECFDF5;border:1px solid #10B981;color:#065F46;display:inline-block;padding:20px 30px;border-radius:10px;font-size:22px;font-weight:bold;">✓ Documents Uploaded Successfully</div>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:10px 40px 30px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
                            <tr>
                                <td style="padding:20px;">
                                    <p style="margin:0;color:#6b7280;font-size:13px;">Application Token</p>
                                    <p style="margin:8px 0 0 0;font-size:18px;font-weight:bold;color:#0057FF;word-break:break-all;">${applicationToken}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:0 40px 30px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;border:1px solid #e5e7eb;border-radius:10px;background:#ffffff;">
                            <tr>
                                <td style="padding:15px;background:#f9fafb;font-size:16px;font-weight:bold;color:#111827;">Uploaded Documents</td>
                            </tr>
                            ${documentListHtml}
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:15px;color:#4b5563;">Your uploaded documents have been received successfully.</p>
                        <p style="font-size:15px;color:#4b5563;">Our verification team will review them shortly.</p>
                        <p style="font-size:15px;color:#4b5563;">If additional documents are required, we will contact you.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'welcome_user': {
            const name = data.name || 'Customer';
            return {
                subject: 'Welcome to Zero Commission!',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                
                <tr>
                    <td style="padding:0 40px;">
                        <h1 style="margin:0;color:#0057FF;text-align:center;font-size:30px;">Welcome to Zero Commission 🎉</h1>
                        <p style="margin-top:25px;font-size:16px;color:#4b5563;line-height:1.8;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.8;">Thank you for registering with <strong>Zero Commission</strong>. We are delighted to have you as part of our growing community dedicated to making loans more transparent, affordable, and rewarding.</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.8;">Your account has been successfully created. You can now explore loan options, submit applications, track your loan status, and receive expert financial assistance—all in one place.</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:30px;">
                        <div style="background:#EEF5FF;border:1px solid #D6E6FF;border-radius:12px;padding:25px;max-width:480px;">
                            <div style="font-size:26px;color:#0057FF;font-weight:bold;margin-bottom:15px;">Your Journey Starts Here 🚀</div>
                            <div style="color:#4b5563;font-size:15px;line-height:1.8;">
                                ✔ Apply for Loans Easily<br>
                                ✔ Track Application Status<br>
                                ✔ Get Expert Financial Guidance<br>
                                ✔ Enjoy a Transparent &amp; Hassle-Free Experience
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px;">
                        <p style="font-size:16px;color:#4b5563;line-height:1.8;">At Zero Commission, our mission is simple: <strong>help you save more by eliminating unnecessary commissions and providing complete transparency throughout your loan journey.</strong></p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.8;">If you ever need assistance, our support team is always ready to help.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'user_password_changed': {
            const name = data.name || 'Customer';
            return {
                subject: 'Password Changed',
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px;">
                        <h2 style="color:#1f2937;text-align:center;">Password Changed</h2>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Your account password has been successfully changed.</p>
                        <div style="background:#f3f4f6;border-left:4px solid #0057FF;padding:18px;margin:25px 0;border-radius:8px;">
                            <p style="margin:0;font-size:15px;color:#374151;"><strong>Time:</strong> ${now}</p>
                        </div>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If this action was performed by you, no further action is required.</p>
                        <p style="font-size:15px;color:#dc2626;line-height:1.7;">If you did not make this change, please contact our support team immediately.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'consultation_ticket_created': {
            const ticketId = data.ticket_id || 'N/A';
            const name = data.name || data.customer_name || 'Valued Customer';
            return {
                subject: `Your Consultation Request (#${ticketId}) Received — Zero Commission`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;font-size:22px;margin-bottom:10px;">Consultation Request Received</h2>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Thank you for reaching out to <strong>Zero Commission</strong>. We have received your consultation request and assigned it a unique tracking number:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:20px;">
                        <div style="background:#f0f7ff;border:1px solid #cce3ff;color:#0057FF;display:inline-block;padding:14px 32px;border-radius:12px;font-size:24px;font-weight:bold;letter-spacing:1px;">#${ticketId}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 40px 25px 40px;">
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Our financial advisory team is reviewing your request and will get back to you within 24 business hours.</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">You will receive an automated email notification as soon as an update is posted on your ticket.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'consultation_update': {
            const ticketId = data.ticket_id || 'N/A';
            const status = data.status || 'Updated';
            const remarks = data.remarks || 'Our advisory team has reviewed and updated your consultation ticket.';
            const name = data.name || data.customer_name || 'Valued Customer';

            let statusColor = '#0057FF'; // default blue
            let statusBg = '#eef5ff';
            if (status === 'Resolved' || status === 'Closed') {
                statusColor = '#10B981'; // green
                statusBg = '#ecfdf5';
            } else if (status === 'Pending') {
                statusColor = '#8B5CF6'; // purple
                statusBg = '#f5f3ff';
            } else if (status === 'Open' || status === 'In Progress') {
                statusColor = '#F59E0B'; // amber
                statusBg = '#fffbeb';
            }

            return {
                subject: `Update on Your Consultation Request (#${ticketId}) — Zero Commission`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;font-size:22px;margin-bottom:10px;">Consultation Ticket Updated</h2>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">There is a new update regarding your consultation ticket <strong>#${ticketId}</strong>.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px;">
                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Ticket ID:</td>
                                    <td align="right" style="font-size:15px;font-weight:bold;color:#1f2937;padding-bottom:10px;">#${ticketId}</td>
                                </tr>
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:15px;">Current Status:</td>
                                    <td align="right" style="padding-bottom:15px;">
                                        <span style="background:${statusBg};color:${statusColor};font-size:13px;font-weight:bold;padding:6px 14px;border-radius:20px;display:inline-block;">${status}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-top:1px dashed #d1d5db;padding-top:15px;">
                                        <div style="font-size:13px;font-weight:bold;color:#4b5563;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Admin Response / Remarks:</div>
                                        <div style="font-size:15px;color:#1f2937;line-height:1.6;background:#ffffff;border:1px solid #e5e7eb;padding:12px 15px;border-radius:8px;">${remarks}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 40px 25px 40px;">
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If you have any further questions or require additional assistance, simply reply to this email or contact our support team.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'admin_consultation_alert': {
            const ticketId = data.ticket_id || 'N/A';
            const name = data.name || data.customer_name || 'Anonymous';
            const phone = data.phone || data.phone_number || 'N/A';
            const email = data.email || 'N/A';
            const subject = data.subject || 'Consultation Request';
            const issue = data.issue || 'N/A';
            return {
                subject: `[New Ticket #${ticketId}] Consultation Request from ${name}`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;font-size:22px;margin-bottom:10px;">New Consultation Request</h2>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">A new consultation ticket has been submitted on <strong>Zero Commission</strong>.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px;">
                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Ticket ID:</td>
                                    <td align="right" style="font-size:15px;font-weight:bold;color:#0057FF;padding-bottom:10px;">#${ticketId}</td>
                                </tr>
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Customer Name:</td>
                                    <td align="right" style="font-size:15px;font-weight:bold;color:#1f2937;padding-bottom:10px;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Phone Number:</td>
                                    <td align="right" style="font-size:15px;font-weight:bold;color:#1f2937;padding-bottom:10px;">${phone}</td>
                                </tr>
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:10px;">Email Address:</td>
                                    <td align="right" style="font-size:15px;font-weight:bold;color:#1f2937;padding-bottom:10px;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:15px;">Subject:</td>
                                    <td align="right" style="font-size:15px;font-weight:bold;color:#1f2937;padding-bottom:15px;">${subject}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-top:1px dashed #d1d5db;padding-top:15px;">
                                        <div style="font-size:13px;font-weight:bold;color:#4b5563;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Issue Description:</div>
                                        <div style="font-size:15px;color:#1f2937;line-height:1.6;background:#ffffff;border:1px solid #e5e7eb;padding:12px 15px;border-radius:8px;">${issue}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 40px 25px 40px;">
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Please log in to the Admin Panel to review and respond to this ticket.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'contact_update': {
            const status = data.status || 'Updated';
            const remarks = data.remarks || 'No additional remarks provided.';
            const name = data.name || 'Applicant';

            let statusColor = '#0057FF'; // default blue
            let statusBg = '#eef5ff';
            if (status === 'Resolved' || status === 'Closed') {
                statusColor = '#10B981'; // green
                statusBg = '#ecfdf5';
            } else if (status === 'Pending') {
                statusColor = '#8B5CF6'; // purple
                statusBg = '#f5f3ff';
            } else if (status === 'Open' || status === 'In Progress') {
                statusColor = '#F59E0B'; // amber
                statusBg = '#fffbeb';
            }

            return {
                subject: `Update on Your Contact Request — Zero Commission`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                ${header}
                <tr>
                    <td style="padding:0 40px;">
                        <h2 style="color:#1f2937;text-align:center;font-size:22px;margin-bottom:10px;">Contact Inquiry Updated</h2>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">There is a new update regarding your contact inquiry.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px;">
                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size:14px;color:#6b7280;padding-bottom:15px;">Current Status:</td>
                                    <td align="right" style="padding-bottom:15px;">
                                        <span style="background:${statusBg};color:${statusColor};font-size:13px;font-weight:bold;padding:6px 14px;border-radius:20px;display:inline-block;">${status}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-top:1px dashed #d1d5db;padding-top:15px;">
                                        <div style="font-size:13px;font-weight:bold;color:#4b5563;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Admin Response / Remarks:</div>
                                        <div style="font-size:15px;color:#1f2937;line-height:1.6;background:#ffffff;border:1px solid #e5e7eb;padding:12px 15px;border-radius:8px;">${remarks}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 40px 25px 40px;">
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">If you have any further questions, feel free to reply to this email or submit a new inquiry on our website.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'contact_request_received': {
            const name = data.name || data.full_name || 'Applicant';
            const subjectText = data.subject || 'General Inquiry';
            return {
                subject: `We Received Your Contact Inquiry — Zero Commission`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px 40px 10px 40px;">
                        <h2 style="margin:0 0 15px 0;font-size:22px;color:#1e293b;">Dear ${name},</h2>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">Thank you for contacting <strong>Zero Commission</strong>. We have received your inquiry regarding "<strong>${subjectText}</strong>" and our support team is reviewing it.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px;">
                        <table width="100%" cellpadding="16" cellspacing="0" style="background:#f8fafc;border-left:4px solid #0197E0;border-radius:8px;">
                            <tr>
                                <td style="font-size:14px;color:#334155;">
                                    <p style="margin:0 0 8px 0;"><strong>What's Next?</strong></p>
                                    <p style="margin:0;">Our executive will check your message and reply or contact you shortly. You will receive an email update as soon as your request status changes.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px 30px 40px;">
                        <p style="font-size:14px;color:#64748b;margin:0;">We appreciate your patience and look forward to assisting you.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        case 'admin_contact_alert': {
            const name = data.name || data.full_name || 'Anonymous';
            const phone = data.phone || data.mobile || 'N/A';
            const email = data.email || 'N/A';
            const subjectText = data.subject || 'General Inquiry';
            const message = data.message || 'No additional message provided.';
            return {
                subject: `[New Contact Inquiry] ${subjectText} — from ${name}`,
                body: `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                ${header}
                <tr>
                    <td style="padding:40px 40px 10px 40px;">
                        <h2 style="margin:0 0 15px 0;font-size:22px;color:#1e293b;">New Contact Inquiry Received</h2>
                        <p style="font-size:15px;color:#4b5563;line-height:1.7;">A new message has been submitted via the website Contact form.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px;">
                        <table width="100%" cellpadding="16" cellspacing="0" style="background:#f8fafc;border-left:4px solid #0197E0;border-radius:8px;">
                            <tr>
                                <td style="font-size:14px;color:#334155;line-height:1.7;">
                                    <p style="margin:0 0 6px 0;"><strong>Name:</strong> ${name}</p>
                                    <p style="margin:0 0 6px 0;"><strong>Mobile:</strong> ${phone}</p>
                                    <p style="margin:0 0 6px 0;"><strong>Email:</strong> ${email}</p>
                                    <p style="margin:0 0 6px 0;"><strong>Subject:</strong> ${subjectText}</p>
                                    <p style="margin:8px 0 0 0;padding-top:8px;border-top:1px solid #e2e8f0;"><strong>Message:</strong><br/>${message}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:15px 40px 30px 40px;">
                        <p style="font-size:14px;color:#64748b;margin:0;">Log in to the Admin Panel Contact Inquiries page to review and respond.</p>
                    </td>
                </tr>
                ${sig}
                ${footer}
            </table>
        </td>
    </tr>
</table>
</div>`
            };
        }

        default:
            return null;
    }
}

/**
 * sendTemplateMail — equivalent of PHP sendTemplateMail()
 * @param {string} toEmail
 * @param {string} templateName
 * @param {object} data
 * @returns {{ status: boolean, http_code: number, message: string }}
 */
export async function sendTemplateMail(toEmail, templateName, data = {}) {
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
        return {
            status: false,
            http_code: 400,
            message: 'Invalid email address'
        };
    }

    // Load Template
    const mail = getTemplate(templateName, data);

    if (!mail) {
        return {
            status: false,
            http_code: 404,
            message: `Template not found: ${templateName}`
        };
    }

    if (!mail.subject || !mail.body) {
        return {
            status: false,
            http_code: 500,
            message: 'Template must return subject and body'
        };
    }

    // Get provider and send
    const provider = MailManager.provider();
    return await provider.send(toEmail, mail.subject, mail.body);
}
