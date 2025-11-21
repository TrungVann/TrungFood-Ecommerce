import { getCategories } from "apps/product-service/src/controllers/product.controller"
import express, {Router} from "express"

const router:Router = express.Router()

router.get("/get-categories", getCategories)

export default router