import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/productModel.js";

//POST Create new order
export const newOrder = expressAsyncHandler(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymnetInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymnetInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    paidAt: Date.now(),
    user: req.user._id,
    totalPrice,
  });

  res.status(200).json({ success: true, order });
});

//GET single order -Admin
export const getOrder = expressAsyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("Order not Found.", 404));
  }
  res.status(200).json({ success: true, order });
});

//GET logged in user order
export const myOrders = expressAsyncHandler(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });
  if (!order) {
    return next(new ErrorHandler("Order not Found.", 404));
  }
  res.status(200).json({ success: true, order });
});

//GET all order -Admin
export const getAllOrders = expressAsyncHandler(async (req, res, next) => {
  const order = await Order.find();
  let totalAmount = 0;
  order.forEach((i) => {
    totalAmount += i.totalPrice;
  });
  res.status(200).json({ success: true, totalAmount, order });
});

//Update order status -Admin
export const updateOrder = expressAsyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Product not found by this id", 404));
  }
  if (order.status === "Delivered")
    return next(new ErrorHandler("You have already delivered This Order", 404));

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });
  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") order.deliveredAt = Date.now();

  await order.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, order });
});

//DELETE order -Admin
export const deleteOrder = expressAsyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Product not found by this id", 404));
  }
  await order.deleteOne();

  res.status(200).json({ success: true });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}
