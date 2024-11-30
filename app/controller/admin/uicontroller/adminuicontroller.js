const Blog = require('../../../model/blog');
const Banner = require('../../../model/banner');
const About = require('../../../model/about');
const Contact = require('../../../model/contact');
const Professional = require('../../../model/professional');
const path = require('path')
const fs = require('fs')

class adminuicontroller {

    // Blog Area start 

    // Add blog form
    async addblogGet(req, res) {
        res.render('admin/uncommon/addblog', { user: req.user });
    }

    // Add data in blog
    async addblogPost(req, res) {
        try {
            const { title, description } = req.body;
            if (!title || !description || !req.file) {
                req.flash('err', 'All fields are required')
                return res.redirect('/admin/addblog');
            }
            const blogData = {
                title: title.trim(),
                description: description.trim(),
                image: req.file.path, // Image path for handling image
            };
            const blog = new Blog(blogData);
            await blog.save();
            req.flash('sucess', 'Blog posted sucessfully')
            return res.redirect('/admin/blog');
        } catch (error) {
            console.error('Error saving blog:', error);
            req.flash('err', 'Error posting blog')
            return res.redirect('/admin/addblog');
        }
    }

    // Handle GET Blog
    async showblog(req, res) {
        try {
            const blogs = await Blog.find();
            res.render('admin/uncommon/blog', { blogs, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving blogs" });
        }
    }


    // Handle GET single blog 
    async singleblog(req, res) {
        const id = req.params.id;
        try {
            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).send('Blog not found');
            }
            res.render('admin/uncommon/editblog', { blog, user: req.user });
        } catch (error) {
            console.error('Error fetching blog:', error);
            return res.status(500).send('Error fetching blog');
        }
    }


    // Handle PUT or PATCH for update blog
    async updateblog(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        if (req.file) {
            const blog = await Blog.findById(id); // Find product by id
            const imagePath = path.resolve(__dirname, '../../../../', blog.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image file:', err);
                    } else {
                        console.log('Image file deleted successfully:', blog.image);
                    }
                });
            } else {
                console.log('File does not exist:', imagePath);
            }
        }
        // Deleting image from uploads folder end
        try {
            const { title, description } = req.body;
            if (!title || !description) {
                return res.status(400).send('All fields are required.');
            }
            const existingBlog = await Blog.findById(id);
            if (!existingBlog) {
                return res.status(404).send('Blog not found.');
            }
            const blogData = {
                title: title.trim(),
                description: description,
                image: req.file ? req.file.path : existingBlog.image,
            };
            // Update the blog
            await Blog.findByIdAndUpdate(id, blogData);
            console.log(`Blog with ID ${id} updated`);
            req.flash('sucess', 'Blog updated successfully');
            return res.redirect('/admin/blog'); // Redirect after updating
        } catch (error) {
            console.error('Error updating blog:', error);
            return res.status(500).send('Error updating blog');
        }
    }


    // Handle Toggle Active Blog
    async toggleBlogActive(req, res) {
        try {
            const blogId = req.params.id;
            const blog = await Blog.findById(blogId);
            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }
            blog.active = !blog.active;
            await blog.save();
            req.flash('sucess', "Active status change sucessfully")
            res.redirect('/admin/blog');
        } catch (error) {
            console.error(error);
            req.flash('err', "This blog is not active for user")
            res.status(500).json({ message: "Error updating blog status" });
        }
    }


    // Handle DELETE for delete blog
    async deleteblog(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        const blog = await Blog.findById(id); // Find product by id
        const imagePath = path.resolve(__dirname, '../../../../', blog.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image file deleted successfully:', blog.image);
                }
            });
        } else {
            console.log('File does not exist:', imagePath);
        }
        // Deleting image from uploads folder end
        try {
            await Blog.findByIdAndDelete(id);
            req.flash('sucess', "Blog delete sucessfully")
            return res.redirect('/admin/blog'); // Redirect blog after deleting data
        } catch (error) {
            console.error('Error deleting blog:', error);
            return res.status(500).send('Error deleting blog');
        }
    }

    // Blog Area end 

    // Banner Area start

    // Banner form
    async addbannerGet(req, res) {
        res.render('admin/uncommon/addbanner', { user: req.user });
    }

    // Post data banner 
    async addbannerPost(req, res) {
        try {
            const { title, description } = req.body;
            if (!title || !description) {
                req.flash('err', 'All fields are required')
                return res.redirect('/admin/addbanner');
            }
            const bannerData = {
                title: title.trim(),
                description: description,
            };
            const banner = new Banner(bannerData);
            await banner.save();
            req.flash('sucess', 'Banner posted sucessfully')
            return res.redirect('/admin/banner');
        } catch (error) {
            console.error('Error saving banner:', error);
            req.flash('err', 'Error posting banner')
            return res.redirect('/admin/addbanner');
        }
    }


    // Handle GET Banner
    async showbanner(req, res) {
        try {
            const banners = await Banner.find();
            res.render('admin/uncommon/banner', { banners, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving banners" });
        }
    }

    // Handle GET single blog 
    async singlebanner(req, res) {
        const id = req.params.id;
        try {
            const banner = await Banner.findById(id);
            if (!banner) {
                return res.status(404).send('Banner not found');
            }
            res.render('admin/uncommon/editbanner', { banner, user: req.user });
        } catch (error) {
            console.error('Error fetching banner:', error);
            return res.status(500).send('Error fetching banner');
        }
    }

    // Handle PUT or PATCH for update banner
    async updatebanner(req, res) {
        const id = req.params.id;
        try {
            const { title, description } = req.body;
            if (!title || !description) {
                return res.status(400).send('All fields are required.');
            }
            const bannerData = {
                title: title.trim(),
                description: description.trim()
            };

            // Update the banner
            await Banner.findByIdAndUpdate(id, bannerData);
            console.log(`Banner with ID ${id} updated`);
            req.flash('sucess', 'Banner updated successfully');
            return res.redirect('/admin/banner'); // Redirect after updating
        } catch (error) {
            console.error('Error updating banner:', error);
            return res.status(500).send('Error updating blog');
        }
    }

    // Handle DELETE for delete banner
    async deletebanner(req, res) {
        const id = req.params.id;
        try {
            await Banner.findByIdAndDelete(id);
            req.flash('sucess', "Banner delete sucessfully")
            return res.redirect('/admin/banner'); // Redirect banner after deleting data
        } catch (error) {
            console.error('Error deleting banner:', error);
            return res.status(500).send('Error deleting banner');
        }
    }

    // Banner area end 

    // About area start

    // Add about form
    async addaboutGet(req, res) {
        res.render('admin/uncommon/addabout', { user: req.user });
    }

    // Add about data
    async addaboutPost(req, res) {
        try {
            const { title, subtitle, description } = req.body;
            if (!title || !subtitle || !description) {
                req.flash('err', 'All fields are required')
                return res.redirect('/admin/addabout');
            }
            const aboutData = {
                title: title.trim(),
                subtitle: subtitle.trim(),
                description: description,
            };
            const about = new About(aboutData);
            await about.save();
            req.flash('sucess', 'About added sucessfully')
            return res.redirect('/admin/about');
        } catch (error) {
            console.error('Error saving about:', error);
            req.flash('err', 'Error posting banner')
            return res.redirect('/admin/addabout');
        }

    }

    // Show about 
    async showabout(req, res) {
        try {
            const abouts = await About.find();
            res.render('admin/uncommon/about', { abouts, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving abouts" });
        }
    }

    // Single about
    async singleabout(req, res) {
        const id = req.params.id;
        try {
            const about = await About.findById(id);
            if (!about) {
                return res.status(404).send('About not found');
            }
            res.render('admin/uncommon/editabout', { about, user: req.user });
        } catch (error) {
            console.error('Error fetching about:', error);
            return res.status(500).send('Error fetching about');
        }
    }


    // Handle PUT or PATCH for update about
    async updateabout(req, res) {
        const id = req.params.id;
        try {
            const { title, subtitle, description } = req.body;
            if (!title || !subtitle || !description) {
                return res.status(400).send('All fields are required.');
            }
            const aboutData = {
                title: title.trim(),
                subtitle: subtitle.trim(),
                description: description,
            };
            await About.findByIdAndUpdate(id, aboutData);
            console.log(`About with ID ${id} updated`);
            req.flash('sucess', 'About updated successfully');
            return res.redirect('/admin/about'); // Redirect after updating
        } catch (error) {
            console.error('Error updating about:', error);
            return res.status(500).send('Error updating blog');
        }
    }

    // Delete about 
    async deleteabout(req, res) {
        const id = req.params.id;
        try {
            await About.findByIdAndDelete(id);
            req.flash('sucess', "About delete sucessfully")
            return res.redirect('/admin/about'); // Redirect banner after deleting data
        } catch (error) {
            console.error('Error deleting about:', error);
            return res.status(500).send('Error deleting about');
        }
    }

    // Show Contactlist
    async contactlist(req, res) {
        try {
            const contacts = await Contact.find();
            res.render('admin/uncommon/contactlist', { contacts, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving abouts" });
        }
    }

    // Our professionals controller area
    
    // Add professional form
    async addprofessionalGet(req, res) {
        res.render('admin/uncommon/addprofessional', { user: req.user })
    }

    // Add professional post
    async addprofessionalPost(req, res) {
        try {
            const { name, description } = req.body;
            if (!name || !description || !req.file) {
                req.flash('err', 'All fields are required')
                return res.redirect('/admin/addprofessional');
            }
            const professionalData = {
                name: name.trim(),
                description: description.trim(),
                image: req.file.path, // Image path for handling image
            };
            const professional = new Professional(professionalData);
            await professional.save();
            req.flash('sucess', 'Professional posted sucessfully')
            return res.redirect('/admin/professional');
        } catch (error) {
            console.error('Error saving blog:', error);
            req.flash('err', 'Error posting blog')
            return res.redirect('/admin/addprofessional');
        }
    }

    // Handle GET professionals
    async showprofessional(req, res) {
        try {
            const professionals = await Professional.find();
            res.render('admin/uncommon/professional', { professionals, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving professionals" });
        } 
    }

    // Handle GET single professional 
    async singleprofessional(req, res) {
        const id = req.params.id;
        try {
            const professional = await Professional.findById(id);
            if (!professional) {
                return res.status(404).send('Professional not found');
            }
            res.render('admin/uncommon/editprofessional', { professional, user: req.user });
        } catch (error) {
            console.error('Error fetching professional:', error);
            return res.status(500).send('Error fetching professional');
        }
    }

    // Handle PUT or PATCH for update professional 
    async updateprofessional(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        if (req.file) {
            const professional = await Professional.findById(id); // Find product by id
            const imagePath = path.resolve(__dirname, '../../../../', professional.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image file:', err);
                    } else {
                        console.log('Image file deleted successfully:', professional.image);
                    }
                });
            } else {
                console.log('File does not exist:', imagePath);
            }
        }
        // Deleting image from uploads folder end
        try {
            const { name, description } = req.body;
            if (!name || !description) {
                return res.status(400).send('All fields are required.');
            }
            const existingProfessional = await Professional.findById(id);
            if (!existingProfessional) {
                return res.status(404).send('Professional not found.');
            }
            const professionalData = {
                name: name.trim(),
                description: description,
                image: req.file ? req.file.path : existingProfessional.image,
            };
            // Update the blog
            await Professional.findByIdAndUpdate(id, professionalData);
            console.log(`Professional with ID ${id} updated`);
            req.flash('sucess', 'Professional updated successfully');
            return res.redirect('/admin/professional'); // Redirect after updating
        } catch (error) {
            console.error('Error updating professional:', error);
            return res.status(500).send('Error updating professional');
        }
    }


    // Handle DELETE for delete professional
    async deleteprofessional(req, res) {
        const id = req.params.id;
        // Deleting image from uploads folder start
        const professional = await Professional.findById(id); // Find product by id
        const imagePath = path.resolve(__dirname, '../../../../', professional.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image file deleted successfully:', professional.image);
                }
            });
        } else {
            console.log('File does not exist:', imagePath);
        }
        // Deleting image from uploads folder end
        try {
            await Professional.findByIdAndDelete(id);
            req.flash('sucess', "Professional deleted sucessfully")
            return res.redirect('/admin/professional'); // Redirect blog after deleting data
        } catch (error) {
            console.error('Error deleting professional:', error);
            return res.status(500).send('Error deleting professional');
        }
    }


}

module.exports = new adminuicontroller();