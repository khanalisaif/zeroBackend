// GraphProvider.js — equivalent of GraphProvider.php
// Sends email via Microsoft Graph API using client credentials

import fetch from 'node-fetch';
import 'dotenv/config';

export class GraphProvider {
    constructor() {
        this.config = {
            tenant_id:     process.env.GRAPH_TENANT_ID,
            client_id:     process.env.GRAPH_CLIENT_ID,
            client_secret: process.env.GRAPH_CLIENT_SECRET,
            sender_email:  process.env.GRAPH_SENDER_EMAIL
        };
    }

    /**
     * Generate Microsoft Graph Access Token
     * @returns {string|false}
     */
    async getAccessToken() {
        const tokenUrl = `https://login.microsoftonline.com/${this.config.tenant_id}/oauth2/v2.0/token`;

        const params = new URLSearchParams({
            client_id:     this.config.client_id,
            client_secret: this.config.client_secret,
            scope:         'https://graph.microsoft.com/.default',
            grant_type:    'client_credentials'
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            const result = await response.json();
            return result.access_token || false;
        } catch {
            return false;
        }
    }

    /**
     * Send Email
     * @param {string} toEmail
     * @param {string} subject
     * @param {string} htmlContent
     * @returns {{ status: boolean, http_code: number, message: string }}
     */
    async send(toEmail, subject, htmlContent) {
        const accessToken = await this.getAccessToken();

        if (!accessToken) {
            return {
                status: false,
                http_code: 401,
                message: 'Unable to generate access token'
            };
        }

        const mailData = {
            message: {
                subject,
                body: {
                    contentType: 'HTML',
                    content: htmlContent
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: toEmail
                        }
                    }
                ]
            },
            saveToSentItems: true
        };

        const url = `https://graph.microsoft.com/v1.0/users/${this.config.sender_email}/sendMail`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mailData)
            });

            const httpCode = response.status;

            if (httpCode === 202) {
                return {
                    status: true,
                    http_code: 202,
                    message: 'Email Sent Successfully'
                };
            }

            const responseBody = await response.json().catch(() => ({}));

            return {
                status: false,
                http_code: httpCode,
                message: responseBody
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
