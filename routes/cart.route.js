const express = require("express");
const router = express.Router();

const CartController = require('../controllers/cart.controller');

router.get("/shopping-cart", CartController.index);
router.get("/add-to-cart/:id", CartController.add);
router.get("/reduce/:id", CartController.reduce);
router.get("/removeAll/:id", CartController.clear);

module.exports = router;