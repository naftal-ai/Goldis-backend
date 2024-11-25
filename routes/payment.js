import express from 'express';
import { payment } from '../controllers/payment.js';

//middlewares 
import authenticate from '../middlewares/authenticate.js';
const router = express.Router();
// API Endpoint to Create Payment Intent
router.post('/',authenticate, payment);


export default router;