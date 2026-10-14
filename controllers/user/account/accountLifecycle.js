import { User } from '../../../models/User.js';
import { DeletionRequest } from '../../../models/DeletionRequest.js';

export async function requestDeletion(req, res) {
    try {
        const user = req.user;
        const { deleteduration, deletion_reason, device_info } = req.body;
        
        const days = deleteduration !== undefined ? parseInt(deleteduration) : 30;
        const scheduledTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        
        user.delete_account_status = true;
        user.delete_account_days_left = days;
        user.deletion_reason = deletion_reason || null;
        user.device = device_info || null;
        user.delete_account_request_time = new Date();
        user.delete_account_time = scheduledTime;
        await user.save();

        // Create or update record in DeletionRequest collection for Admin processing
        await DeletionRequest.deleteMany({ user_id: user._id });
        const delReq = new DeletionRequest({
            user_id: user._id,
            deleteduration: days,
            deletion_reason: deletion_reason || null,
            device_info: device_info || null,
            status: 'PENDING',
            delete_account_time: scheduledTime
        });
        await delReq.save();
        
        return res.status(200).json({
            success: true,
            message: `Account deletion scheduled. Your account will be deleted in ${days} days.`,
            data: {
                deletion_request_id: `del_req_${delReq._id}`,
                delete_account_status: true,
                delete_account_days_left: days,
                delete_account_time: scheduledTime
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getDeletionStatus(req, res) {
    try {
        const user = req.user;
        return res.status(200).json({
            success: true,
            message: 'Account deletion status retrieved.',
            data: {
                delete_account_status: user.delete_account_status || false,
                delete_account_days_left: user.delete_account_days_left || 0,
                delete_account_request_time: user.delete_account_request_time || null,
                delete_account_time: user.delete_account_time || null,
                deletion_reason: user.deletion_reason || null,
                device: user.device || null
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function cancelDeletion(req, res) {
    try {
        const user = req.user;
        
        user.delete_account_status = false;
        user.delete_account_days_left = 0;
        user.delete_account_time = null;
        user.delete_account_request_time = null;
        user.deletion_reason = null;
        await user.save();

        // Remove from DeletionRequest collection
        await DeletionRequest.deleteMany({ user_id: user._id });
        
        return res.status(200).json({
            success: true,
            message: 'Account deletion request cancelled successfully.',
            data: {
                delete_account_status: false,
                delete_account_days_left: 0
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
