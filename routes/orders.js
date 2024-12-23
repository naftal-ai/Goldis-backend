//order routes
import express from "express";
import {
  create,
  read,
  readAllUsersOrders,
  readByOrderId,
  reactivate,
  updateQuantity,
  updateStatus,
  delete_o
} from "../controllers/orders.js";
//middlewares
import authenticate from "../middlewares/authenticate.js";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";

const router = express.Router();

//create : user
router.post("/", authenticate, create);

//reactivate : user
router.post("/:orderId/reactivate", authenticate, reactivate);

//update : user
router.put("/:orderId", authenticate, updateQuantity);

//update status : admin
router.put("/:orderId/status", authenticate, authorizeAdmin, updateStatus);


//read
router.get("/", authenticate, read);

//all : admin
router.get("/all", authenticate, authorizeAdmin, readAllUsersOrders);

//by order id : admin | user
router.get("/:id", authenticate, readByOrderId);


//delete : user
router.delete("/:orderId", authenticate, delete_o);

export default router;
