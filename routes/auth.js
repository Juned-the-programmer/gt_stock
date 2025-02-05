import express from "express";
import {registerSoftware, updateSoftwareDetails, requestOTP, verifyOTP, registerCompany, getComopanyList, getCompanyDetailByID, registerApplication, applicationLogin } from "../controllers/auth.js";
const router = express.Router();

// Register
router.post('/register/company/v1', registerCompany)
router.get('/company/list/v1', getComopanyList)
router.get('/company/:__id/v1', getCompanyDetailByID)
router.post('/register/application/v1', registerApplication)

// Create software
router.post('/register/software/v1', registerSoftware)
router.put('/register/software/:__id/v1', updateSoftwareDetails)

// OTP login
router.post('/auth/request-otp/v1', requestOTP)
router.post('/auth/verify-otp/v1', verifyOTP)

// Login
router.post('/auth/app/login/v1', applicationLogin)
export default router;