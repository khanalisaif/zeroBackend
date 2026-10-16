// PRP SMS Service — OTP Sending via https://api.prpsms.biz
// API KEY  : fse6dRbOCQS1yNc
// SENDER   : DGVAHN

const PRP_SMS_CONFIG = {
    url: 'https://api.prpsms.biz/BulkSMSapi/keyApiSendSMS/SendSmsTemplateName',
    apiKey: 'fse6dRbOCQS1yNc',
    sender: 'DGVAHN',
    templates: {
        signup:         'SignUp_OTP',
        login:          'SignIn_OTP',
        forgotPassword: 'Reset_Password_OTP',
        twoFa:          '2FA_Verification_OTP',
    }
};

/**
 * Send OTP via PRP SMS
 * @param {string} mobileNo   - 10-digit mobile number (e.g. "9876543210")
 * @param {string} otp        - The OTP code to send
 * @param {'signup'|'login'|'forgotPassword'|'twoFa'} type - Template type
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function sendOtpSms(mobileNo, otp, type = 'login') {
    const templateName = PRP_SMS_CONFIG.templates[type] || PRP_SMS_CONFIG.templates.login;
    const cleanMobile = String(mobileNo || '').replace(/\D/g, '').slice(-10);

    const payload = {
        sender: PRP_SMS_CONFIG.sender,
        templateName,
        smsReciever: [
            {
                mobileNo: cleanMobile,
                templateParams: String(otp)
            }
        ]
    };

    try {
        const response = await fetch(PRP_SMS_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': PRP_SMS_CONFIG.apiKey
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        let json = null;
        try { json = JSON.parse(text); } catch (_) { /* non-JSON response is fine */ }

        if (!response.ok) {
            console.error(`[PRP SMS] HTTP ${response.status} for ${mobileNo}:`, text);
            return { success: false, message: `SMS API error: HTTP ${response.status}` };
        }

        console.log(`[PRP SMS] OTP sent to ${mobileNo} via template "${templateName}"`);
        return { success: true, message: 'SMS sent successfully.', data: json || text };

    } catch (err) {
        console.error(`[PRP SMS] Network error for ${mobileNo}:`, err.message);
        return { success: false, message: `SMS send failed: ${err.message}` };
    }
}
