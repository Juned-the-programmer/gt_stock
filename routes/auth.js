import express from "express";
import {registerSoftware, updateSoftwareDetails, requestOTP, verifyOTP, registerCompany, getComopanyList, getCompanyDetailByID, applicationLogin, addUserRole, getSoftwareDetailById, getListUsersBysoftwareId, updateUserDetail, getUserDetailById, applicationLogout } from "../controllers/auth.js";
const router = express.Router();

// Register
router.post('/register/company/v1', registerCompany)
router.get('/company/list/v1', getComopanyList)
router.get('/company/:__id/v1', getCompanyDetailByID)

// Create software
router.post('/register/software/v1', registerSoftware)
router.get('/software/:__id/v1', getSoftwareDetailById)
router.put('/register/software/:__id/v1', updateSoftwareDetails)

// OTP login
router.post('/auth/request-otp/v1', requestOTP)
router.post('/auth/verify-otp/v1', verifyOTP)

// Login
router.post('/auth/app/login/v1', applicationLogin)
router.post('/auth/logout/v1', applicationLogout)

// Create a USER
router.post('/auth/user/role/v1', addUserRole)
router.get('/auth/users/list/:__id/v1', getListUsersBysoftwareId)
router.get('/auth/user/:__id/v1', getUserDetailById)
router.put('/auth/user/:__id/v1', updateUserDetail)

export default router;