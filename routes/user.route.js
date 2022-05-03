let LocalStrategy = require("passport-local").Strategy;
let passport = require("passport");
const express = require("express");
const csrf = require("csurf");

const router = express.Router();
const csrfProtection = csrf();

const middleware = require("../middleware");
const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../config/validator");

const UserController = require('../controllers/user.controller');

router.use(csrfProtection);

// GET: display the signup form with csrf token
router.get("/signup", middleware.isNotLoggedIn, UserController.signupIndex);

// GET: display the signin form with csrf token
router.get("/signin", middleware.isNotLoggedIn, UserController.signinIndex);

// GET: logout
router.get("/logout", middleware.isLoggedIn, UserController.logout);

// GET: display user's profile
router.get("/profile", middleware.isLoggedIn, UserController.profile);

// POST: handle the signup logic
router.post("/signup", [
    middleware.isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignup,
    passport.authenticate("local.signup", {
      successRedirect: "/user/profile",
      failureRedirect: "/user/signup",
      failureFlash: true,
    }),
  ],
  UserController.signup
);

// POST: handle the signin logic
router.post("/signin", [
    middleware.isNotLoggedIn,
    userSignInValidationRules(),
    validateSignin,
    passport.authenticate("local.signin", {
      failureRedirect: "/user/signin",
      failureFlash: true,
    }),
  ],
  UserController.signin
);

module.exports = router;