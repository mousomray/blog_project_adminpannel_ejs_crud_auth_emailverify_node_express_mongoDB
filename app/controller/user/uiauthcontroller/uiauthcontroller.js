const UserModel = require('../../../model/user');
const { comparePassword } = require('../../../middleware/user_auth/auth');
const EmailVerifyModel = require('../../../model/otpverify')
const userOTPverify = require('../../../helper/userOTPverify');
const transporter = require('../../../config/emailtransporter')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class uiauthcontroller {

    // For Register form
    async registerGet(req, res) {
        return res.render('user/authview/register', { user: req.user });
    }

    // For Register Post
    async registerPost(req, res) {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password || !role) {
                return res.status(400).send('All fields are required');
            }
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                req.flash('err', 'User already exist with this email');
                return res.redirect('/register');
            }
            if (password.length < 8) {
                return res.status(400).send('Password should be at least 8 characters long.');
            }
            // Hash password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new UserModel({
                ...req.body, password: hashedPassword
            });
            // Save user to database
            await user.save();
            userOTPverify(req, user)
            req.flash('sucess', 'Register Successfully OTP sent your email')
            return res.redirect('/login');
        } catch (error) {
            console.error('Error during registration:', error);
            return res.status(500).send('An unexpected error occurred.');
        }
    }

    // verify otp get
    async verifyOtpGet(req, res) {
        return res.render('user/authview/verifyotp');
    }

    // Verify OTP
    async verifyOtpPost(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).send("All fields are required");
            }
            const existingUser = await UserModel.findOne({ email });
            if (!existingUser) {
                req.flash('err', 'This email is not registered')
                return res.redirect('/verifyotp');
            }
            if (existingUser.is_verified) {
                req.flash('err', 'This email is already verified')
                return res.redirect('/verifyotp');
            }
            const emailVerification = await EmailVerifyModel.findOne({ userId: existingUser._id, otp });
            if (!emailVerification) {
                if (!existingUser.is_verified) {
                    await userOTPverify(req, existingUser);
                    req.flash('err', 'Invalid OTP new OTP is successfully sent you email')
                    return res.redirect('/verifyotp');
                }
                return res.status(400).json({ status: false, message: "Invalid OTP" });
            }
            // Check if OTP is expired
            const currentTime = new Date();
            // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
            const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
            if (currentTime > expirationTime) {
                // OTP expired, send new OTP
                await userOTPverify(req, existingUser);
                req.flash('err', 'OTP expired new OTP is successfully sent your email')
                return res.redirect('/verifyotp');
            }
            // OTP is valid and not expired, mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification document
            await EmailVerifyModel.deleteMany({ userId: existingUser._id });
            req.flash('sucess', 'Your Email is Verified')
            return res.redirect('/login');
        } catch (error) {
            console.error(error);
            req.flash('err', 'Unable to verify email please try again later')
            return res.redirect('/verifyotp');
        }
    }

    // For login form
    async loginGet(req, res) {
        return res.render('user/authview/login', { user: req.user });
    }


    // For Login post
    async loginPost(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).send("All fields are required")
            }
            const user = await UserModel.findOne({ email });
            if (!user) {
                req.flash('err', 'User Not Found');
                return res.redirect('/login');
            }
            // Check if user verified
            if (!user.is_verified) {
                req.flash('err', 'User is Not Verified');
                return res.redirect('/login');
            }

            // Ensure only users of the specific role can log in
            if (user.role === 'admin') {
                req.flash('err', 'Admin cannot access user page');
                return res.redirect(`/login`);
            }

            const isMatch = comparePassword(password, user.password);
            if (!isMatch) {
                req.flash('err', 'Invalid Credential');
                return res.redirect('/login');
            }
            // Generate a JWT token
            const token = jwt.sign({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }, process.env.USER_API_KEY, { expiresIn: "1d" });

            // Handling token in cookie
            if (token) {
                res.cookie('user_auth', token);
                req.flash('sucess', 'Login Successfully')
                return res.redirect('/');
            } else {
                req.flash('err', 'Something went wrong')
                return res.redirect('/login');
            }
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).send('An unexpected error occurred');
        }
    }

    // Handle Logout
    async logout(req, res) {
        res.clearCookie('user_auth');
        req.flash('sucess', 'Logout Successfully')
        return res.redirect('/login');
    }

    // Reset Password UI link 
    async resetpasswordlinkGet(req, res) {
        return res.render('user/authview/passwordreset', { user: req.user })
    }

    // Reset Password post 
    async resetpasswordlinkPost(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                req.flash('err', 'Email is Required')
                return res.redirect('/passwordresetlink');
            }
            const user = await UserModel.findOne({ email });
            if (!user) {
                req.flash('err', 'Email doesnot exist')
                return res.redirect('/passwordresetlink');
            }
            // Generate token for password reset
            const secret = user._id + process.env.USER_API_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '20m' });
            console.log("My forget token...", token)
            // Reset Link and this link generate by frontend developer
            // FRONTEND_HOST_FORGETPASSWORD = http://localhost:3004/forgetpassword
            const resetLink = `${process.env.FRONTEND_HOST_FORGETPASSWORD}/${user._id}/${token}`;
            // Send password reset email  
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Password Reset Link",
                html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`
            });
            // Send success response
            req.flash('sucess', 'Verification link sent check your email')
            return res.redirect('/passwordresetlink');

        } catch (error) {
            console.log(error);
            req.flash('err', 'Error something went wrong')
            return res.redirect('/passwordresetlink');

        }
    }

    // Forget Password get
    async forgetPasswordGet(req, res) {
        const { id, token } = req.params;
        return res.render('user/authview/forgetpassword', { userId: id, token: token, user: req.user });
    }

    // Forget Password
    async forgetPasswordPost(req, res) {
        try {
            const { id, token } = req.params;
            const { password, confirmPassword } = req.body;
            const user = await UserModel.findById(id);
            console.log("My user...", user)
            if (!user) {
                req.flash('err', 'User Not Found')
                return res.redirect(`/forgetpassword/${id}/${token}`);
            }
            // Validate token check 
            const new_secret = user._id + process.env.USER_API_KEY;
            jwt.verify(token, new_secret);

            if (!password || !confirmPassword) {
                req.flash('err', 'New password and confirm password are required')
                return res.redirect(`/forgetpassword/${id}/${token}`);
            }

            if (password.length < 8) {
                req.flash('err', "Password should be atleast 8 characters long")
                return res.redirect(`/forgetpassword/${id}/${token}`);
            }

            if (password !== confirmPassword) {
                req.flash('err', 'New password and confirm password are not matched')
                return res.redirect(`/forgetpassword/${id}/${token}`);
            }
            // Generate salt and hash new password
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);

            // Update user's password
            await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });

            // Send success response
            req.flash('sucess', 'Password changes successfully')
            return res.redirect('/login');

        } catch (error) {
            req.flash('err', 'Error updating password')
            return res.redirect(`/forgetpassword/${id}/${token}`);
        }
    }

}

module.exports = new uiauthcontroller();