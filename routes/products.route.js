const express = require("express");
const router = express.Router();

const ProductController = require('../controllers/product.controller');

// GET: display all products
router.get("/", ProductController.index);

// GET: search box
router.get("/search", ProductController.search);

//GET: get a certain category by its slug (this is used for the categories navbar)
router.get("/:slug", ProductController.getBySlug);

// GET: display a certain product by its id
router.get("/:slug/:id", ProductController.getById);

module.exports = router;
