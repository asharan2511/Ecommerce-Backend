import express, { Router } from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  deleteProductReviews,
  getAllProducts,
  getProduct,
  getProductReviews,
  productUpdate,
} from "../controllers/productController.js";
import { authorizedRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const productRouter = Router();

productRouter
  .get("/products", getAllProducts)
  .get("/product/:id", getProduct)
  .get("/reviews", getProductReviews);
productRouter.post(
  "/admin/product/new",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  createProduct
);
productRouter
  .put(
    "/admin/product/:id",
    isAuthenticatedUser,
    authorizedRoles("admin"),
    productUpdate
  )
  .put("/review", isAuthenticatedUser, createProductReview);
productRouter.delete(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizedRoles("admin"),
  deleteProduct
);
productRouter.delete("/reviews", isAuthenticatedUser, deleteProductReviews);

export default productRouter;
