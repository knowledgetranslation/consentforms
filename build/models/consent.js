var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var Consent = new Schema({
    consentGiven: Boolean,
    name: String,
    telephone: String,
    email: String,
    date: {type: Date, default: Date.now },
    _consentForm: { type: Schema.Types.ObjectId, ref: "ConsentForm" }
});

module.exports = mongoose.model('Consent', Consent);