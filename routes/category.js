import express from "express";
import {
  create,
  readAll,
  update,
  deleteCategory,
} from "../controllers/categories.js";

//middlewares
import authenticate from "../middlewares/authenticate.js";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";

const router = express.Router();

//Create : admin
router.post("/", authenticate, authorizeAdmin, create);

//Read
router.get("/", readAll);

//Update : admin
router.patch("/:id", authenticate, authorizeAdmin, update);
//Delete : admin
router.delete("/:id", authenticate, authorizeAdmin, deleteCategory);
export default router;
