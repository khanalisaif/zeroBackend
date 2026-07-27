// GmailProvider.js — equivalent of GmailProvider.php
// NOTE: Gmail OAuth2 provider - requires credentials.json and token.json
// Full Google API client equivalent using googleapis npm package

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

export class GmailProvider {
    constructor() {
        this.config = {
            credentials: process.env.GMAIL_CREDENTIALS_PATH,
            token:       process.env.GMAIL_TOKEN_PATH,
            scope:       process.env.GMAIL_SCOPE || 'https://www.googleapis.com/auth/gmail.send'
        };

        this.client = null;
        this.gmail = null;

        this._initClient();
    }

    _initClient() {
        if (!fs.existsSync(this.config.credentials)) {
            throw new Error('credentials.json not found. Set GMAIL_CREDENTIALS_PATH in .env');
        }

        const credentials = JSON.parse(fs.readFileSync(this.config.credentials, 'utf8'));
        const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

        this.client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        this._loadToken();

        this.gmail = google.gmail({ version: 'v1', auth: this.client });
    }

    _loadToken() {
        if (!fs.existsSync(this.config.token)) {
            throw new Error('token.json not found. Authenticate Gmail first.');
        }

        const token = JSON.parse(fs.readFileSync(this.config.token, 'utf8'));
        this.client.setCredentials(token);

        // Handle token refresh
        this.client.on('tokens', (newTokens) => {
            if (!newTokens.refresh_token) {
                newTokens.refresh_token = token.refresh_token;
            }
            fs.writeFileSync(this.config.token, JSON.stringify(newTokens, null, 2));
        });
    }

    /**
     * Send Email via Gmail API
     * @param {string} toEmail
     * @param {string} subject
     * @param {string} htmlContent
     * @returns {{ status: boolean, http_code: number, message: string }}
     */
    async send(toEmail, subject, htmlContent) {
        try {
            const logoPath = path.join(process.cwd(), 'services', 'email', 'assets', 'logo.png');
            let rawMessage = '';

            if (fs.existsSync(logoPath)) {
                const logoBase64 = fs.readFileSync(logoPath, 'base64');
                const boundary = '====_Boundary_' + Date.now() + '_====';
                rawMessage = [
                    'MIME-Version: 1.0',
                    `To: ${toEmail}`,
                    `Subject: ${subject}`,
                    `Content-Type: multipart/related; boundary="${boundary}"`,
                    '',
                    `--${boundary}`,
                    'Content-Type: text/html; charset=UTF-8',
                    'Content-Transfer-Encoding: 8bit',
                    '',
                    htmlContent,
                    '',
                    `--${boundary}`,
                    'Content-Type: image/png; name="logo.png"',
                    'Content-Transfer-Encoding: base64',
                    'Content-ID: <companylogo>',
                    'Content-Disposition: inline; filename="logo.png"',
                    '',
                    logoBase64,
                    `--${boundary}--`
                ].join('\r\n');
            } else {
                rawMessage = [
                    'MIME-Version: 1.0',
                    'Content-Type: text/html; charset=UTF-8',
                    `To: ${toEmail}`,
                    `Subject: ${subject}`,
                    '',
                    htmlContent
                ].join('\r\n');
            }

            const encoded = Buffer.from(rawMessage)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: { raw: encoded }
            });

            return {
                status: true,
                http_code: 200,
                message: 'Email Sent Successfully'
            };

        } catch (err) {
            return {
                status: false,
                http_code: 500,
                message: err.message
            };
        }
    }
}
