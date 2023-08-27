import express from "express";
import {
  deleteOrder,
  getAllOrders,
  getOrder,
  myOrders,
  newOrder,
  updateOrder,
} from "../controllers/orderController.js";
import { authorizedRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const orderRouter = express.Router();

orderRouter.post("/order/new", isAuthenticatedUser, newOrder);
orderRouter
  .get("/order/:id", isAuthenticatedUser, authorizedRoles("admin"), getOrder)
  .get("/orders/me", isAuthenticatedUser, myOrders)
  .get(
    "/admin/orders",
    isAuthenticatedUser,
    authorizedRoles("admin"),
    getAllOrders
  );
orderRouter.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  updateOrder
);
orderRouter.delete(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  deleteOrder
);
export default orderRouter;
