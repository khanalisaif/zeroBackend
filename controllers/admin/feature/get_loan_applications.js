import { LoanApplication } from '../../../models/LoanApplication.js';

export async function getLoanApplications(req, res) {
    try {
        const getParam = (key) => req.body[key] || req.query[key];

        const statusStr = (getParam('status') || '').trim();
        const documentStatus = (getParam('document_status') || '').trim();
        const profession = (getParam('profession') || '').trim();
        const loanType = (getParam('loan_type') || '').trim();
        const minAmount = parseFloat(getParam('loan_amount_min'));
        const maxAmount = parseFloat(getParam('loan_amount_max'));
        const fromDate = (getParam('from_date') || '').trim();
        const toDate = (getParam('to_date') || '').trim();
        const search = (getParam('search') || '').trim();
        
        const limit = parseInt(getParam('limit')) || 10;
        const page = parseInt(getParam('page')) || 1;
        const skip = (page - 1) * limit;

        const query = {};
        if (statusStr) query.status = statusStr;
        if (documentStatus) query.Document_Status = documentStatus;
        if (profession) query.profession = profession;
        if (loanType) query.loan_type = loanType;
        
        if (!isNaN(minAmount) || !isNaN(maxAmount)) {
            query.loan_amount = {};
            if (!isNaN(minAmount)) query.loan_amount.$gte = minAmount;
            if (!isNaN(maxAmount)) query.loan_amount.$lte = maxAmount;
        }

        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { number: { $regex: search, $options: 'i' } },
                { application_token: { $regex: search, $options: 'i' } }
            ];
        }

        const sortBy = getParam('sort_by') || '_id';
        const sortOrder = getParam('sort_order') === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        const total = await LoanApplication.countDocuments(query);
        const apps = await LoanApplication.find(query).sort(sort).skip(skip).limit(limit).lean();

        return res.json({
            status: true,
            data: apps,
            pagination: {
                current_page: page,
                per_page: limit,
                total_records: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Server error', error: err.message });
    }
}