import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../../../utils/responseHandler.js';
import { CreditAccount } from '../../../models/CreditAccount.js';

// 6.1 GET /api/accounts/summary
export const getSummary = async (req, res) => {
    try {
        const accounts = await CreditAccount.find({ user_id: req.user._id });
        let total_outstanding = 0, total_credit_limit = 0, active = 0, closed = 0;
        accounts.forEach(acc => {
            total_outstanding += acc.current_balance || 0;
            total_credit_limit += acc.credit_limit || 0;
            if ((acc.account_status || '').toLowerCase() === 'active') active++;
            else closed++;
        });
        return sendSuccess(res, 200, 'Accounts summary retrieved.', {
            total_accounts: accounts.length,
            active_accounts: active,
            closed_accounts: closed,
            total_outstanding_balance: `₹ ${total_outstanding.toLocaleString('en-IN')}`,
            total_credit_limit: `₹ ${total_credit_limit.toLocaleString('en-IN')}`,
            utilization_percent: total_credit_limit > 0 ? Math.round((total_outstanding / total_credit_limit) * 100) : 0
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 6.2 GET /api/accounts/index
export const getAccounts = async (req, res) => {
    try {
        const filter = { user_id: req.user._id };
        if (req.query.status && req.query.status !== 'all') {
            filter.account_status = req.query.status.toLowerCase() === 'active' ? 'Active' : 'Closed';
        }
        if (req.query.type && req.query.type !== 'all') {
            filter.account_type = req.query.type.toLowerCase() === 'loan' ? { $ne: 'Credit Card' } : 'Credit Card';
        }
        const accounts = await CreditAccount.find(filter);
        return sendSuccess(res, 200, 'Accounts list retrieved.', {
            count: accounts.length,
            accounts: accounts.map(acc => ({
                id: acc._id,
                bank_name: acc.bank_name,
                account_type: acc.account_type,
                account_number_masked: acc.account_number_masked || 'XXXX-XXXX-0000',
                current_outstanding: acc.current_balance || 0,
                current_outstanding_formatted: `₹ ${(acc.current_balance || 0).toLocaleString('en-IN')}`,
                emi_amount_formatted: acc.emi_amount ? `₹ ${acc.emi_amount.toLocaleString('en-IN')} / Month` : null,
                account_status: (acc.account_status || 'ACTIVE').toUpperCase()
            }))
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 6.3 GET /api/accounts/detail
export const getAccountDetails = async (req, res) => {
    try {
        const id = req.query.id || req.body.id;
        if (!id || !mongoose.isValidObjectId(id)) {
            return sendError(res, 404, 'Account not found.');
        }
        const acc = await CreditAccount.findOne({ _id: id, user_id: req.user._id });
        if (!acc) return sendError(res, 404, 'Account not found.');
        return sendSuccess(res, 200, 'Account detail retrieved.', {
            id: acc._id,
            bank_name: acc.bank_name,
            account_type: acc.account_type,
            sanctioned_amount_formatted: acc.sanctioned_amount ? `₹ ${acc.sanctioned_amount.toLocaleString('en-IN')}` : null,
            current_outstanding_formatted: `₹ ${(acc.current_balance || 0).toLocaleString('en-IN')}`,
            interest_rate: acc.interest_rate,
            tenure_months: acc.tenure_months,
            remaining_tenure_months: acc.remaining_tenure_months,
            open_date: acc.open_date,
            account_status: (acc.account_status || 'ACTIVE').toUpperCase()
        });
    } catch (e) { return sendError(res, 500, e.message); }
};

// 6.4 GET /api/accounts/payment-history
export const getPaymentHistory = async (req, res) => {
    try {
        const accountId = req.query.account_id || req.query.id;
        if (!accountId || !mongoose.isValidObjectId(accountId)) {
            return sendError(res, 404, 'Account not found.');
        }
        const acc = await CreditAccount.findOne({ _id: accountId, user_id: req.user._id });
        if (!acc) return sendError(res, 404, 'Account not found.');
        return sendSuccess(res, 200, 'Payment history retrieved.', {
            account_id: accountId,
            months_count: parseInt(req.query.months) || 12,
            history: acc.payment_history || []
        });
    } catch (e) { return sendError(res, 500, e.message); }
};
