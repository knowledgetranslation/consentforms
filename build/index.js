var express = require("express");
var app = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var static = require("express-static");
var mailer = require('express-mailer');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(smtpTransport({
    host: 'localhost'
}));

var mongoose = require('mongoose');

var sass    = require('node-sass-middleware');
var path    = require('path');
var expressSanitizer = require("express-sanitizer");

var _ = require("underscore");

mongoose.connect('mongodb://localhost/');

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var ObjectId = require('mongoose').Types.ObjectId;

app.use(
  sass({
    src: __dirname + '/public/sass',
    dest: __dirname + '/public/css',
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css'
  })
);

app.locals.marked = require('marked');
app.locals.moment = require('moment');

app.use(express.static(path.join( __dirname, 'public')));

console.log(__dirname);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressSanitizer()); // this line follows express.bodyParser()
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'jade');

app.locals.virtualDirectory = '/forms';

var Account = require("./models/account");
var Consent = require("./models/consent");
var ConsentForm = require("./models/consent_form");

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

function ensureLoggedIn (req, res, next) {
  console.log(req.user);
  if (req.user) {
    next();
  }
  else
  {
    res.redirect(app.locals.virtualDirectory + "/login");
  }
}

function sanitizeAndReplaceUndefined(str, req) {
  var strToReturn = '';
  strToReturn = req.sanitize(str);
  if(strToReturn === undefined) {
    strToReturn = '';
  }
  console.log("strToReturn", str, strToReturn, req.sanitize(str));
  return strToReturn;
}

function getSanitizedConsentForm(req) {
  return {
    slug: sanitizeAndReplaceUndefined(req.body.slug, req),
    email: sanitizeAndReplaceUndefined(req.body.email, req),
    title: sanitizeAndReplaceUndefined(req.body.title, req),
    shortTitle: sanitizeAndReplaceUndefined(req.body.shortTitle, req),
    subTitle: sanitizeAndReplaceUndefined(req.body.subTitle, req),
    institution: sanitizeAndReplaceUndefined(req.body.institution, req),
    whatsInvolved: sanitizeAndReplaceUndefined(req.body.whatsInvolved, req),
    principalInvestigator: sanitizeAndReplaceUndefined(req.body.principalInvestigator, req),
    qualifiedInvestigator: sanitizeAndReplaceUndefined(req.body.qualifiedInvestigator, req),
    coInvestigators: sanitizeAndReplaceUndefined(req.body.coInvestigators, req),
    siteAddress: sanitizeAndReplaceUndefined(req.body.siteAddress, req),
    purpose: sanitizeAndReplaceUndefined(req.body.purpose, req),
    introduction: sanitizeAndReplaceUndefined(req.body.introduction, req),
    description: sanitizeAndReplaceUndefined(req.body.description, req),
    potentialHarms: sanitizeAndReplaceUndefined(req.body.potentialHarms, req),
    potentialBenefits: sanitizeAndReplaceUndefined(req.body.potentialBenefits, req),
    confidentialityAndPrivacy: sanitizeAndReplaceUndefined(req.body.confidentialityAndPrivacy, req),
    costsAndReimbursements: sanitizeAndReplaceUndefined(req.body.costsAndReimbursements, req),
    participationAndWithdrawal: sanitizeAndReplaceUndefined(req.body.participationAndWithdrawal, req),
    ethicsBoardContact: sanitizeAndReplaceUndefined(req.body.ethicsBoardContact, req),
    studyContact: sanitizeAndReplaceUndefined(req.body.studyContact, req),
    funding: sanitizeAndReplaceUndefined(req.body.funding, req),
    sponsor: sanitizeAndReplaceUndefined(req.body.sponsor, req),
    consentBody: sanitizeAndReplaceUndefined(req.body.consentBody, req),
    thankYouMessage: sanitizeAndReplaceUndefined(req.body.thankYouMessage, req),
    statementOfInvestigator: sanitizeAndReplaceUndefined(req.body.statementOfInvestigator, req)
  };
}

function sendEmail(model, modelConsent) {
  var body = "<p>The following participant has submitted their consent for " + model.title + " - " + model.subTitle + " - " + model.institution + "</p>";
      body += "<p>I agree: " + modelConsent.consentGiven + "<br/>";
      body += "Name: " + modelConsent.name + "<br/>";
      body += "Phone: " + modelConsent.telephone + "<br/>";
      body += "E-mail: " + modelConsent.email + "</p>";
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'webmaster@knowledgetranslation.ca',
    //to: "halls@smh.ca,nikolas.leblanc@gmail.com",
    to: model.email || "halls@smh.ca,nikolas.leblanc@gmail.com",
    subject: 'Consent submitted',
    html: body
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
  });
}

app.post('/login',
  passport.authenticate('local',
    {
      successRedirect: app.locals.virtualDirectory + "/dashboard",
      failureRedirect: app.locals.virtualDirectory + "/login",
      failureFlash: false
    }
  )
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect(app.locals.virtualDirectory);
});

// Create consent form
app.post("/consentForms", ensureLoggedIn, function(req, res) {
  var consentForm = getSanitizedConsentForm(req);
  new ConsentForm(consentForm)
    .save(function(err, consentForm) {
      res.redirect(app.locals.virtualDirectory + "/dashboard");
    });
});

// Edit consent form
app.post("/consentForms/:id/edit", ensureLoggedIn, function(req, res) {
  var consentForm = getSanitizedConsentForm(req);
  console.log(consentForm);
  ConsentForm.findOneAndUpdate({ "_id": req.params.id }, consentForm, function (err, model) {
    console.log(err);
    console.log(model);
    res.redirect(app.locals.virtualDirectory + "/dashboard");
  });
});

// Create consent
app.post("/consentForms/:id/consents/new", function(req, res) {
  var consent = {
    _consentForm: req.params.id,
    consentGiven: req.body.consentGiven,
    name: req.body.name,
    telephone: req.body.telephone,
    email: req.body.email
  };
  new Consent(consent)
    .save(function(err, modelConsent) {
      if (err) return err;
      ConsentForm.findById(req.params.id, function (err, model) {
        if (err) return err;
        model.consents.push(modelConsent);
        model.save(function(err, model) {
          sendEmail(model, modelConsent);
          res.redirect(app.locals.virtualDirectory + "/consentForms/" + model.slug + "/thanks");
        });
      });
    });
});

// Display (create) consent form
app.get("/consentForms/new", ensureLoggedIn, function(req, res) {
  res.render("admin/consentForm/create", {user: req.user, title: "Create a consent form"});
});

// Display consent form
app.get("/consentForms/:slug", function(req, res) {
  ConsentForm.findOne({ "slug": req.params.slug }, function (err, model) {
    if (err) return err;
    res.render('public/consentForm/show', { title: model.title, consentForm: model});
  });
});

// Display consents
app.get("/consentForms/:id/consents", ensureLoggedIn, function(req, res) {
  ConsentForm.findById(req.params.id, function(err, consentForm) {
    Consent.find({ "_consentForm": req.params.id }, function (err, collection) {
      if (err) return err;
      res.render('admin/consent/list', { user: req.user, title: consentForm.title, model: consentForm, collection: collection});
    });
  });
});

// Display (edit) consent form
app.get("/consentForms/:id/edit", ensureLoggedIn, function(req, res) {
  ConsentForm.findById(req.params.id, function (err, model) {
    if (err) return err;
    res.render('admin/consentForm/edit', { user: req.user, title: "Edit consent form", consentForm: model});
  });
});

// Display consent form thank you page
app.get("/consentForms/:slug/thanks", function(req, res) {
  ConsentForm.findOne({slug:req.params.slug}, function (err, model) {
    if (err) return err;
    res.render("public/consentForm/thanks", {consentForm: model});
  });
});

// Display login page
app.get("/login", function(req, res) {
  res.render('admin/login', { user: req.user, title: 'Hey', message: 'Hello there!', messages: {1:'one',2:'two',3:'three'}});
});

// Display home page
app.get("/", function(req, res) {
  if (req.user) {
    res.redirect(app.locals.virtualDirectory + "/dashboard");
  }
  else
  {
    res.redirect(app.locals.virtualDirectory + "/login");
  }
});

// Display dashboard
app.get("/", function(req, res) {
  res.redirect(app.locals.virtualDirectory + "/dashboard");
});

// Display dashboard
app.get("/dashboard", ensureLoggedIn, function(req, res) {
  ConsentForm.find({}).populate("consents").sort("_id").exec(function (err, collection) {
    if (err) return err;
    console.log(collection);
    res.render('admin/dashboard', { user: req.user, title: "Dashboard", consentForms: collection});
  });
});

// Display dashboard
app.get("/updateCounts", ensureLoggedIn, function(req, res) {
  ConsentForm.find({}).exec(function(err, consentForms) {
    _.each(consentForms, function(consentForm) {
      Consent.find({_consentForm:ObjectId(consentForm._id)}).exec(function(err, consents) {
        consentForm.consents = consents;
        consentForm.save(function(err, model) {

        });
      });
    });
  });
});

// Delete consent form
app.get("/consentForms/:id/delete", ensureLoggedIn, function(req, res) {
  ConsentForm.findById(req.params.id, function (err, model) {
    if (err) return err;
    model.remove();
    res.redirect(app.locals.virtualDirectory + "/dashboard");
  });
});

// Delete consent
app.get("/consents/:id/delete", ensureLoggedIn, function(req, res) {
  Consent.findById(req.params.id, function (err, consent) {
    if (err) return err;
    ConsentForm.findById(consent._consentForm, function (err, consentForm) {
      if (err) return err;
      consent.remove();
      res.redirect(app.locals.virtualDirectory + "/consentForms/" + consentForm.id + "/consents");
    });
  });
});

app.get("/register", ensureLoggedIn, function(req, res) {
  res.render('admin/register');
});

app.post('/register', ensureLoggedIn, function(req, res, next) {
  Account.register(new Account({ username: req.body.username, firstname: req.body.firstName, lastname: req.body.lastName }), req.body.password, function(err, account) {
      if (err) {
          console.log(err);
          return res.render('admin/register', { account : account });
      }
      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect(app.locals.virtualDirectory + "/login"); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect(app.locals.virtualDirectory + "dashboard");
        });
      })(req, res, next);
  });
});

var server = app.listen(1234, function() {
  console.log("listening");
});
