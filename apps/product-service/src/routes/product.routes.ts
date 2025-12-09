import isAuthenticated from "@packages/middleware/isAuthenticated";
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  getShopProducts,
  uploadProductImage,
} from "../controllers/product.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct)
router.get("/get-shop-product", isAuthenticated, getShopProducts)


export default router;
