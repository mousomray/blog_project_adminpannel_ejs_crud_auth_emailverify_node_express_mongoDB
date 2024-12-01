const UserModel = require('../../../model/user');
const { comparePassword } = require('../../../middleware/admin_auth/auth');
const EmailVerifyModel = require('../../../model/otpverify')
const adminOTPverify = require('../../../helper/adminOTPverify');
const transporter = require('../../../config/emailtransporter')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class uiauthcontroller {

    //Register form
    async registerGet(req, res) {
        return res.render('admin/authview/register', { user: req.user });
    }

    // Post data in Register form
    async registerPost(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password || !req.file) {
                return res.status(400).send('All fields are required, including an image.');
            }
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                req.flash('err', 'User already exist with this email');
                return res.redirect('/admin/register');
            }
            if (password.length < 8) {
                return res.status(400).send('Password should be at least 8 characters long.');
            }
            // Hash password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new UserModel({
                ...req.body, password: hashedPassword, image: req.file.path
            });
            // Save user to database
            await user.save();
            adminOTPverify(req, user)
            req.flash('sucess', 'Register Successfully OTP sent your email')
            return res.redirect('/admin/login');
        } catch (error) {
            console.error('Error during registration:', error);
            return res.status(500).send('An unexpected error occurred.');
        }
    }

    // verify OTP show form for register 
    async verifyOtpGet(req, res) {
        return res.render('admin/authview/userverify');
    }

    // verify OTP Post data for verify email for register
    async verifyOtpPost(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).send("All fields are required");
            }
            const existingUser = await UserModel.findOne({ email });
            if (!existingUser) {
                req.flash('err', 'This email is not registered')
                return res.redirect('/admin/verifyuser');
            }
            if (existingUser.is_verified) {
                req.flash('err', 'This email is already verified')
                return res.redirect('/admin/verifyuser');
            }
            const emailVerification = await EmailVerifyModel.findOne({ userId: existingUser._id, otp });
            if (!emailVerification) {
                if (!existingUser.is_verified) {
                    await adminOTPverify(req, existingUser);
                    req.flash('err', 'Invalid OTP new OTP is successfully sent you email')
                    return res.redirect('/admin/verifyuser');
                }
                return res.status(400).json({ status: false, message: "Invalid OTP" });
            }
            // Check if OTP is expired
            const currentTime = new Date();
            // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
            const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
            if (currentTime > expirationTime) {
                // OTP expired, send new OTP
                await adminOTPverify(req, existingUser);
                req.flash('err', 'OTP expired new OTP is successfully sent your email')
                return res.redirect('/admin/userverify');
            }
            // OTP is valid and not expired, mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification document
            await EmailVerifyModel.deleteMany({ userId: existingUser._id });
            req.flash('sucess', 'Your Email is Verified')
            return res.redirect('/admin/login');
        } catch (error) {
            console.error(error);
            req.flash('err', 'Unable to verify email please try again later')
            return res.redirect('/admin/verifyuser');
        }
    }

    // For Login form
    async loginGet(req, res) {
        return res.render('admin/authview/login', { user: req.user });
    }

    // For Login
    async loginPost(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).send("All fields are required")
            }
            const user = await UserModel.findOne({ email });
            if (!user) {
                req.flash('err', 'User Not Found');
                return res.redirect('/admin/login');
            }
            // Check if user verified
            if (!user.is_verified) {
                req.flash('err', 'User is Not Verified');
                return res.redirect('/admin/login');
            }

            // Check if the user is an admin
            if (user.role !== 'admin') {
                req.flash('err', "Admin pannel only can access by admin")
                return res.redirect('/admin/login')
            }

            const isMatch = comparePassword(password, user.password);
            if (!isMatch) {
                req.flash('err', 'Invalid Credential');
                return res.redirect('/admin/login');
            }
            // Generate a JWT token
            const token = jwt.sign({
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
            }, process.env.ADMIN_API_KEY, { expiresIn: "1d" });

            // Handling token in cookie
            if (token) {
                res.cookie('admin_auth', token);
                req.flash('sucess', 'Login Successfully')
                return res.redirect('/admin');
            } else {
                req.flash('err', 'Something went wrong')
                return res.redirect('/admin/login');
            }
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).send('An unexpected error occurred');
        }
    }

    // Dashboard area
    async profilepage(req, res) {
        try {
            const user = req.user;
            console.log("User Data:", user);
            res.render('admin/authview/profile', {
                title: 'Profile Page',
                user: user
            });
        } catch (error) {
            res.status(500).send("Server error");
        }
    };

    // Handle Logout
    async logout(req, res) {
        res.clearCookie('admin_auth');
        req.flash('sucess', 'Logout Successfully')
        return res.redirect('/admin/login');
    }

    // Show update password form
    async updatepasswordGet(req, res) {
        return res.render('admin/authview/updatepassword', { user: req.user });
    }

    // Update Password post 
    async updatepasswordPost(req, res) {
        try {
            const userId = req.user._id; // Get user ID from token
            const { oldPassword, newPassword, confirmPassword } = req.body;
            if (!oldPassword || !newPassword || !confirmPassword) {
                req.flash('err', "All fields are required")
                return res.redirect('/admin/updatepassword') 
            }
            if (newPassword.length < 8) {
                req.flash('err', "Password should be atleast 8 characters long")
                return res.redirect('/admin/updatepassword')
            }
            if (newPassword !== confirmPassword) {
                req.flash('err', "Password don't match")
                return res.redirect('/admin/updatepassword')
            }
            const user = await UserModel.findById(userId);
            if (!user) {
                req.flash('err', "User not found")
                return res.redirect('/admin/updatepassword')
            }
            const isMatch = comparePassword(oldPassword, user.password);
            if (!isMatch) {
                req.flash('err', "Old password is incorrect")
                return res.redirect('/admin/updatepassword')
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
            await user.save();
            req.flash('sucess', 'Password update successfully')
            return res.redirect('/admin');
        } catch (error) {
            req.flash('err', "Error updating password")
            return res.redirect('/admin/updatepassword')
        }
    }
}

module.exports = new uiauthcontroller();










