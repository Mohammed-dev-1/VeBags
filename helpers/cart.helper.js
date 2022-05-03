const Product = require("../models/product");

// create products array to store the info of each product in the cart
const productsFromCart = async(cartItems) => {
  let productsId = cartItems.map(item => item.productId);
  let products = await Product.find({
    '_id': { $in: productsId }
  }).populate("category");
  
  let productIndex;
  cartItems.forEach(item => {
    productIndex = products.findIndex(
      product => product._id.toString() == item.productId.toString()
    );
    
    products[productIndex] = {
      ...products[productIndex]._doc,
      qty: item.qty,
      totalPrice: item.price
    }
    console.log('Item: ', products[productIndex]);
  });
  
  return products;
}

module.exports = {
  productsFromCart
}