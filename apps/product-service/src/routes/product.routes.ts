import isAuthenticated from "@packages/middleware/isAuthenticated";
import {
  createDiscountCodes,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
} from "../controllers/product.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);

export default router;
