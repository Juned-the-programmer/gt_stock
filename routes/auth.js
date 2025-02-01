import express from "express";
import { registerUser, getUserList, getUserDetailByID, registerSoftware, updateSoftwareDetails, requestOTP, verifyOTP } from "../controllers/auth.js";
const router = express.Router();

// Register
router.post('/auth/register/v1', registerUser)
router.get('/users/list/v1', getUserList)
router.get('/user/:__id/v1', getUserDetailByID)

// Create software
router.post('/register/software/v1', registerSoftware)
router.put('/register/software/:__id/v1', updateSoftwareDetails)

// OTP login
router.post('/auth/request-otp/v1', requestOTP)
router.post('/auth/verify-otp/v1', verifyOTP)
export default router;