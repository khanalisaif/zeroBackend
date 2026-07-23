// profession_enum.js — equivalent of profession_enum.php

export const Profession = {
    SALARIED: 'SALARIED',
    SELF_EMPLOYED: 'SELF_EMPLOYED',
    BUSINESS_OWNER: 'BUSINESS_OWNER',
    PROFESSIONAL: 'PROFESSIONAL',
    STUDENT: 'STUDENT',
    RETIRED: 'RETIRED',
    HOMEMAKER: 'HOMEMAKER',

    all() {
        return [
            this.SALARIED,
            this.SELF_EMPLOYED,
            this.BUSINESS_OWNER,
            this.PROFESSIONAL,
            this.STUDENT,
            this.RETIRED,
            this.HOMEMAKER
        ];
    }
};
