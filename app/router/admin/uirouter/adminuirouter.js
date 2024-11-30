const express = require('express');
const adminuicontroller = require('../../../controller/admin/uicontroller/adminuicontroller');
const uploadImage = require('../../../helper/imagehandler') // Image area
const { AdminuiAuth } = require('../../../middleware/admin_auth/uiauth'); // For UI auth
const router = express.Router();

// Blog Routing Area 
router.get('/addblog', AdminuiAuth, adminuicontroller.addblogGet) // Show Form 
router.post('/addblogcreate', AdminuiAuth, uploadImage.single('image'), adminuicontroller.addblogPost)//Post blog
router.get('/blog', AdminuiAuth, adminuicontroller.showblog)//Show Data
router.get('/singleblogget/:id', AdminuiAuth, adminuicontroller.singleblog) //Single Blog page
router.post('/updateblogpost/:id', AdminuiAuth, uploadImage.single('image'), adminuicontroller.updateblog)//Update Blog
router.get('/toggleblogactive/:id', AdminuiAuth, adminuicontroller.toggleBlogActive);
router.get('/deleteblogget/:id', AdminuiAuth, adminuicontroller.deleteblog);//Delete Blog 


// Banner Routing Area 
router.get('/addbanner', AdminuiAuth, adminuicontroller.addbannerGet) // Show Form
router.post('/addbannercreate', AdminuiAuth, uploadImage.single('image'), adminuicontroller.addbannerPost)//Post banner
router.get('/banner', AdminuiAuth, adminuicontroller.showbanner)//Show Banner Data
router.get('/singlebannerget/:id', AdminuiAuth, adminuicontroller.singlebanner) //Single Banner page
router.post('/updatebannerpost/:id', AdminuiAuth, uploadImage.single('image'), adminuicontroller.updatebanner)//Update Blog
router.get('/deletebannerget/:id', AdminuiAuth, adminuicontroller.deletebanner);//Delete Banner


// About Routing Area 
router.get('/addabout', AdminuiAuth, adminuicontroller.addaboutGet)
router.post('/addaboutcreate', AdminuiAuth, adminuicontroller.addaboutPost)
router.get('/about', AdminuiAuth, adminuicontroller.showabout)
router.get('/singleaboutget/:id', AdminuiAuth, adminuicontroller.singleabout)
router.post('/updateaboutpost/:id', AdminuiAuth, adminuicontroller.updateabout)
router.get('/deleteaboutget/:id', AdminuiAuth, adminuicontroller.deleteabout);


// Contact list routing area
router.get('/contactlist', AdminuiAuth, adminuicontroller.contactlist)

// Our professionals routing area
router.get('/addprofessional', AdminuiAuth, adminuicontroller.addprofessionalGet)
router.post('/addprofessionalcreate', AdminuiAuth, uploadImage.single('image'), adminuicontroller.addprofessionalPost)
router.get('/professional', AdminuiAuth, adminuicontroller.showprofessional)
router.get('/singleprofessionalget/:id', AdminuiAuth, adminuicontroller.singleprofessional) //Single professional page
router.post('/updateprofessionalpost/:id', AdminuiAuth, uploadImage.single('image'), adminuicontroller.updateprofessional)//Update professional
router.get('/deleteprofessionalget/:id', AdminuiAuth, adminuicontroller.deleteprofessional);//Delete professional

module.exports = router; 