var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var ConsentForm = new Schema({
    slug: String,
    email: String,
    title: String,
    shortTitle: String,
    subTitle: String,
    institution: String,
    principalInvestigator: String,
    qualifiedInvestigator: String,
    coInvestigators: String,
    siteAddress: String,
    introduction: String,
    purpose: String,
    description: String,
    whatsInvolved: String,
    potentialHarms: String,
    potentialBenefits: String,
    confidentialityAndPrivacy: String,
    costsAndReimbursements: String,
    participationAndWithdrawal: String,
    ethicsBoardContact: String,
    studyContact: String,
    funding: String,
    sponsor: String,
    consentBody: String,
    thankYouMessage: String,
    statementOfInvestigator: String,
    consents: [{ type: Schema.Types.ObjectId, ref: "Consent" }]
});

module.exports = mongoose.model('ConsentForm', ConsentForm);