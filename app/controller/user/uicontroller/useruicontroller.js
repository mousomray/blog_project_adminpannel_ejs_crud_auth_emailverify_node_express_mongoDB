const Blog = require('../../../model/blog');
const Banner = require('../../../model/banner');
const About = require('../../../model/about');
const Contact = require('../../../model/contact');
const Professional = require('../../../model/professional');
const path = require('path')
const fs = require('fs')

class useruicontroller {

    // For to show banner
    async showhome(req, res) {
        try {
            const banners = await Banner.find();
            const blogs = await Blog.find({ active: true });
            res.render('user/uncommon/home', { banners, blogs, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving home" });
        }
    }

    // Single Blog 
    async singleblog(req, res) {
        const id = req.params.id;
        try {
            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).send('Blog not found');
            }
            res.render('user/uncommon/blogdetails', { blog, user: req.user });
        } catch (error) {
            console.error('Error fetching blog:', error);
            return res.status(500).send('Error fetching blog');
        }
    }

    // Show about 
    async showabout(req, res) {
        try {
            const abouts = await About.find();
            const professionals = await Professional.find();
            res.render('user/uncommon/about', { abouts, professionals, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving abouts" });
        }
    }

    // Add contact form 
    async addcontactGet(req, res) {
        res.render('user/uncommon/contact', { user: req.user });
    }

    // Add contact post
    async addcontactPost(req, res) {
        try {
            const { name, phone, email, message } = req.body;
            if (!name || !phone || !email || !message) {
                req.flash('err', 'All fields are required')
                return res.redirect('/contact');
            }
            const contactData = {
                name: name.trim(),
                phone: Number(phone),
                email: email.trim(),
                message: message.trim()
            };
            const contact = new Contact(contactData);
            await contact.save();
            req.flash('sucess', 'Contact added sucessfully')
            return res.redirect('/contact');
        } catch (error) {
            console.error('Error saving contact:', error);
            req.flash('err', 'Error posting contact')
            return res.redirect('/contact');
        }
    }

    // Add comment for blog
    async addcomment(req, res) {
        const id = req.params.id;
        const { name, email, phone, message } = req.body;
        if (!name || !email || !phone || !message) {
            return res.status(400).send("All fields are required");
        }
        try {
            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).send("Blog not found.");
            }
            blog.comments.push({ name, email, phone, message });
            await blog.save();
            req.flash('sucess', "Comment added successfully")
            res.redirect(`/blogdetails/${id}`);
        } catch (err) {
            console.log("Error adding comment", err);

        }
    }

    // Show comments 
    async showcomment(req, res) {
        const id = req.params.id;
        try {
            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).send("Blog not found.");
            }
            res.render('user/uncommon/blogdetails', { blog, user: req.user });
        } catch (err) {
            res.status(500).send("Error fetching comment", err);
        }
    }

}

module.exports = new useruicontroller();