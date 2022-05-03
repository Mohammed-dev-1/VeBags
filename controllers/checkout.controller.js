const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Cart = require("../models/cart");
const Order = require("../models/order");

// GET: checkout form with csrf token
const index = async (req, res, next) => {
  const errorMsg = req.flash("error")[0];

  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  //load the cart with the session's cart's id from the db
  cart = await Cart.findById(req.session.cart._id);

  const errMsg = req.flash("error")[0];
  
  res.render("shop/checkout", {
    total: cart.totalCost,
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Checkout",
  });
}

// POST: handle checkout logic and payment using Stripe
const add = async (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  stripe.charges.create(
    {
      amount: cart.totalCost * 100,
      currency: "usd",
      source: req.body.stripeToken,
      description: "Test charge",
    },
    function (err, charge) {
      if (err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("/checkout");
      }
      const order = new Order({
        user: req.user,
        cart: {
          totalQty: cart.totalQty,
          totalCost: cart.totalCost,
          items: cart.items,
        },
        address: req.body.address,
        paymentId: charge.id,
      });
      order.save(async (err, newOrder) => {
        if (err) {
          console.log(err);
          return res.redirect("/checkout");
        }
        await cart.save();
        await Cart.findByIdAndDelete(cart._id);
        req.flash("success", "Successfully purchased");
        req.session.cart = null;
        res.redirect("/user/profile");
      });
    }
  );
}

module.exports = {
  add, index
}