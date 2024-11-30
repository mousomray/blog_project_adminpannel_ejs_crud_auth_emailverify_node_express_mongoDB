const express = require('express');
const uiauthcontroller = require('../../../controller/admin/uiauthcontroller/uiauthcontroller');
const { AdminuiAuth } = require('../../../middleware/admin_auth/uiauth'); // For UI auth
const uploadImage = require('../../../helper/imagehandler') // Image handle Area
const router = express.Router();

router.get('/register', uiauthcontroller.registerGet) // Show Register Form
router.post('/registercreate', uploadImage.single('image'), uiauthcontroller.registerPost);
router.get('/verifyuser', uiauthcontroller.verifyOtpGet) // For to show verify user form 
router.post('/verifyusercreate', uiauthcontroller.verifyOtpPost) // For to add data verify user form 
router.get('/login', uiauthcontroller.loginGet) // Get data in login
router.post('/logincreate', uiauthcontroller.loginPost) // Post data in login
router.get('/adminlogout', uiauthcontroller.logout); // For Logout
router.get('/', AdminuiAuth, uiauthcontroller.profilepage); // For profile

module.exports = router;  