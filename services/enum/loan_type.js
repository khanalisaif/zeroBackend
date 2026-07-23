// loan_type.js — equivalent of loan_type.php

export const LoanType = {
    PERSONAL: 'Personal Loan',
    BUSINESS: 'Business Loan',
    CAR: 'Car Loan',
    EDUCATION: 'Education Loan',
    HOME: 'Home Loan',
    TWOWHEELER: 'Two-Wheeler Loan',
    MEDICAL: 'Medical Loan',
    TRAVEL: 'Travel Loan',

    all() {
        return [
            this.PERSONAL,
            this.BUSINESS,
            this.CAR,
            this.EDUCATION,
            this.HOME,
            this.TWOWHEELER,
            this.MEDICAL,
            this.TRAVEL
        ];
    }
};
