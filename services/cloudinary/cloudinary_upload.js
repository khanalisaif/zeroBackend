// cloudinary_upload.js — equivalent of cloudinary_upload.php
// Uses native form-data upload via node-fetch (same cURL logic)

import crypto from 'crypto';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local temp file path
 * @param {string} folder   - Cloudinary folder
 * @param {string} cloudName
 * @param {string} apiKey
 * @param {string} apiSecret
 * @returns {{ url: string, public_id: string }}
 */
export async function uploadToCloudinary(filePath, folder, cloudName, apiKey, apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = crypto
        .createHash('sha1')
        .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp.toString());
    form.append('folder', folder);
    form.append('signature', signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
            method: 'POST',
            body: form
        }
    );

    const result = await response.json();

    if (!result.secure_url) {
        throw new Error('Cloudinary upload failed');
    }

    return {
        url: result.secure_url,
        public_id: result.public_id
    };
}
