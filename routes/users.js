//user routes
import express from "express";
import { signup, signin, user, admin } from "../controllers/users.js";

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
//create another admin

//read : admin
router.get('/', authenticate, authorizeAdmin, admin.readAll);
router.get('/:id', authenticate, authorizeAdmin, admin.readById);

//update : admin 

//delete :admin
router.delete('/:id', authenticate, authorizeAdmin, admin.delete_u);
export default router;