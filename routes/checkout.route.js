const express = require("express");
const csrf = require("csurf");

const csrfProtection = csrf();
const router = express.Router();

const middleware = require("../middleware");
const CheckoutController = require('../controllers/checkout.controller');

//Use csrf token
router.use(csrfProtection);

router.get("/", middleware.isLoggedIn, CheckoutController.index);
router.post("/", middleware.isLoggedIn, CheckoutController.add);

module.exports = router;