//products routes
import express from "express";
import { create, read, update, delete_p } from "../controllers/products.js";
const router = express.Router();

// CRUD for Products

//CREATE
router.post("/", create);

//READ
//all
router.get("/", read.all);

//by category

//by price

//by name

//by id
router.get("/:id", read.byId);

//UPDATE

router.put("/:id", update);

//DELETE

router.delete("/:id", delete_p);


export default router;