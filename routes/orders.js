//order routes
import express from "express";
import { create } from '../controllers/orders.js';
//middlewares
import authenticate from '../middlewares/authenticate.js'; 

const router = express.Router();


//create : user 

router.post("/", authenticate, create);

export default router;

//read 

//all : admin

//by user 

//by product : admin

