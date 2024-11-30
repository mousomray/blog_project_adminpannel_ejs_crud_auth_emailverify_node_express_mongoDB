const express = require('express');
const uiauthcontroller = require('../../../controller/user/uiauthcontroller/uiauthcontroller');
const router = express.Router(); 

router.get('/register', uiauthcontroller.registerGet) // Show Register Form
router.post('/registercreate', uiauthcontroller.registerPost); 
router.get('/verifyotp', uiauthcontroller.verifyOtpGet) // For to show verify user form 
router.post('/verifyotpcreate', uiauthcontroller.verifyOtpPost) // For to add data verify user form
router.get('/login', uiauthcontroller.loginGet) // Get data in login
router.post('/logincreate', uiauthcontroller.loginPost) // Post data in login
router.get('/userlogout', uiauthcontroller.logout); // For Logout
router.get('/passwordresetlink', uiauthcontroller.resetpasswordlinkGet);// Show reset link from
router.post('/passwordresetlinkcreate', uiauthcontroller.resetpasswordlinkPost);// Show Data 
router.get('/forgetpassword/:id/:token', uiauthcontroller.forgetPasswordGet) // Show Forget Form
router.post('/forgetpasswordcreate/:id/:token', uiauthcontroller.forgetPasswordPost) //Add data


module.exports = router;  