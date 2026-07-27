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

        case 'admin_login_otp': {
            const otp = data.otp || '';
            return {
                subject: 'OTP for admin login.',
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
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">Dear Admin,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely access your panel, please use the verification code below:</p>
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
                subject: 'OTP for login.',
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
                        <p style="font-size:16px;color:#4b5563;line-height:1.7;">To securely access and track your loan application, please use the verification code below:</p>
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
