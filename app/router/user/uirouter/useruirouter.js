const express = require('express');
const useruicontroller = require('../../../controller/user/uicontroller/useruicontroller');
const { UseruiAuth } = require('../../../middleware/user_auth/uiauth')
const router = express.Router();

// User Routing Area 
router.get('/', UseruiAuth, useruicontroller.showhome) // Show Form  
router.get('/blogdetails/:id', UseruiAuth, useruicontroller.singleblog) //Single Blog page
router.get('/about', UseruiAuth, useruicontroller.showabout)
router.get('/contact', UseruiAuth, useruicontroller.addcontactGet)
router.post('/contactcreate', UseruiAuth, useruicontroller.addcontactPost)
router.post('/addcomment/:id', UseruiAuth, useruicontroller.addcomment);
router.get('/showcomment/:id', UseruiAuth, useruicontroller.showcomment);

module.exports = router;   