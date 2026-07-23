// MailManager.js — equivalent of MailManager.php

import 'dotenv/config';
import { GraphProvider } from './providers/GraphProvider.js';
import { GmailProvider } from './providers/GmailProvider.js';

let providerInstance = null;

export class MailManager {
    static provider() {
        if (providerInstance !== null) {
            return providerInstance;
        }

        const driver = (process.env.MAIL_DRIVER || 'graph').toLowerCase();

        switch (driver) {
            case 'graph':
                providerInstance = new GraphProvider();
                break;
            case 'gmail':
                providerInstance = new GmailProvider();
                break;
            default:
                throw new Error(`Unsupported mail driver: ${driver}`);
        }

        return providerInstance;
    }
}
