// cloudinary_upload.js — equivalent of cloudinary_upload.php
// Uses official Cloudinary Node.js SDK to prevent form-data deprecation warnings

import { v2 as cloudinary } from 'cloudinary';

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local temp file path
 * @param {string} folder   - Cloudinary folder
 * @param {string} cloudName
 * @param {string} apiKey
 * @param {string} apiSecret
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadToCloudinary(filePath, folder, cloudName, apiKey, apiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });

    const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto'
    });

    if (!result || !result.secure_url) {
        throw new Error('Cloudinary upload failed');
    }

    return {
        url: result.secure_url,
        public_id: result.public_id
    };
}
