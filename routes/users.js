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


//read myData : user
router.get('/my-data',authenticate, user.read);

//read : admin
router.get('/', authenticate, authorizeAdmin, admin.readAll);
router.get('/:id', authenticate, authorizeAdmin, admin.readById);


//delete :admin
router.delete('/:id', authenticate, authorizeAdmin, admin.delete_u);
export default router;