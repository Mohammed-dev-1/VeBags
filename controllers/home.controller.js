const Product = require("../models/product");

const index = async (req, res, next) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category")
      .limit(28);
    
    res.render("shop/home", { 
      pageName: "Home", 
      products,
      successMsg,
      errorMsg, 
    });
  } 
  catch (error) {
    console.log('Home Error: ', error);
    res.redirect("/");
  }  
}

module.exports = {
  index
}