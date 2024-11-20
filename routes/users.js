//user routes
import express from "express";
import { signup, signin, user } from "../controllers/users.js";

//middlewares
import authenticate from '../middlewares/authenticate.js';
import authorizeAdmin from '../middlewares/authorizeAdmin.js';

const router = express.Router();

//CRUD

//create sign up
router.post('/signup', signup);
//sign in
router.post('/signin', signin);
//sign out

//privilege user
//read myData : user
router.get('/my-data',authenticate, user.read);
//update my info : user

//delete my user

//privilege admin
//read : admin

//update : admin 

//delete :admin

export default router;