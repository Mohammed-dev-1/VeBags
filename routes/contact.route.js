const express = require('express');
const csrf = require("csurf");
const router = express.Router();
const csrfProtection = csrf();

const { userContactUsValidationRules, validateContactUs } = require("../config/validator");
const ContactController = require('../controllers/contact.controller');

//Use csrf token for scure request
router.use(csrfProtection);

//GET: display contact us page and form with csrf tokens
router.get("/contact-us", ContactController.index);

//POST: handle contact us form logic using nodemailer
router.post(
  "/contact-us",
  [userContactUsValidationRules(), validateContactUs],
  ContactController.contactMail
);

module.exports = router;