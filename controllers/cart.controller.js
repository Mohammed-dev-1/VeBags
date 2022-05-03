const Cart = require("../models/cart");
const Product = require("../models/product");

const {productsFromCart} = require('../helpers/cart.helper');

// GET: add a product to the shopping cart when "Add to cart" button is pressed
const add = async (req, res, next) => {
  const productId = req.params.id;
  let userCart;

  try {
    // get the correct cart, either from the db, session, or an empty cart.
    if (req.user) {
      userCart = await Cart.findOne({ user: req.user._id });
    }

    if (
      (req.user && !userCart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      userCart = await new Cart(req.session.cart);
    } 
    else if (!req.user || !userCart) {
      userCart = new Cart({});
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = await userCart.items.findIndex(
      item => item.productId.toString() == product._id.toString()
    );

    if (itemIndex > -1) {
      // if product exists in the userCart, update the quantity
      userCart.items[itemIndex].qty++;
      userCart.items[itemIndex].price = userCart.items[itemIndex].qty * product.price;
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      userCart.items.push({
        qty: 1,
        productId: product._id,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      })
    }

    userCart.totalQty++;
    userCart.totalCost += product.price;

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      userCart.user = req.user._id;
      await userCart.save();
    }

    req.session.cart = userCart;
    req.flash("success", "Item added to the shopping cart");
    res.redirect('back');
  } 
  catch (err) {
    console.log('Add to cart error: ', err.message);
    res.redirect("/");
  }
}

// GET: view shopping cart contents
const index = async (req, res, next) => {
  
  try {
    let cart = req.session.cart;
    let products = null;

    // find the cart, whether in session or in db based on the user state
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
      if(cart) {
        // if user is signed in and has cart, load user's cart from the db
        req.session.cart = cart;
        products = await productsFromCart(cart.items);
      }
    } 
    else if(req.session.cart) {
      products = await productsFromCart(req.session.cart.items);
    }

    return res.render("shop/shopping-cart", {
      pageName: "Shopping Cart",
      products,
      cart,
    });
  } 
  catch (err) {
    console.log('Cart index error: ', err.message);
    res.redirect("/");
  }
}

// GET: reduce one from an item in the shopping cart
const reduce = async(req, res, next) => {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }


    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
}

// GET: remove all instances of a single product from the cart
const clear = async(req, res, next) => {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
}

module.exports = {
  add, index, reduce, clear
}