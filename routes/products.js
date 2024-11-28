//products routes
import express from "express";

//middlewares
import authenticate from "../middlewares/authenticate.js";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";

import { create, read, update, delete_p } from "../controllers/products.js";

const router = express.Router();

// CRUD for Products

//CREATE
router.post("/",authenticate, authorizeAdmin, create);

//READ
//with filters
router.get("/", read);

//UPDATE

router.patch("/:id",authenticate, authorizeAdmin, update);

//DELETE

router.delete("/:id",authenticate, authorizeAdmin, delete_p);


export default router;