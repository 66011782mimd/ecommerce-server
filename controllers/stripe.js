const prisma = require("../config/prisma");

const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);

exports.payment = async (req, res) => {
  try {
    // Check user
    // req.user.id

    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
    });

    // ถ้าไม่พบตะกร้า
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Stripe ต้องการจำนวนเงินเป็นหน่วยย่อย เช่น 100 บาท = 10000
    const amountTHB = Math.round(Number(cart.cartTotal) * 100);

    // ตรวจยอดเงิน
    if (!amountTHB || amountTHB <= 0) {
      return res.status(400).json({
        message: "Invalid cart total",
      });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",

      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log("Stripe Payment Error:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};