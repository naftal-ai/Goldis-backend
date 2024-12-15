//order routes
import express from "express";
import {
  create,
  read,
  readAllUsersOrders,
  readByOrderId,
  reactivate,
} from "../controllers/orders.js";
//middlewares
import authenticate from "../middlewares/authenticate.js";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";

const router = express.Router();

//create : user

router.post("/", authenticate, create);

//reactivate : user

router.post("/:orderId/reactivate", authenticate, reactivate);

//read

router.get("/", authenticate, read);

//all : admin
router.get("/all", authenticate, authorizeAdmin, readAllUsersOrders);

//by order id : admin
router.get("/:id", authenticate, readByOrderId);

//by product : admin

export default router;
