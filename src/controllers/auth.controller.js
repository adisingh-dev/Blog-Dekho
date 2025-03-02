import bcrypt from 'bcrypt';
import {pool} from '../db/config.js';
import jwt from 'jsonwebtoken';


class AuthController {
    // destroy a session
    static destroySession(req, res, next) {
        res.clearCookie('bearer_token', {
            httpOnly: false
        });
        req.session.destroy((error) => {
            if(error) {
                return res.status(500).json({
                    statusCode: 500,
                    message: "Something went wrong. Please try again later"
                });
            }
            return res.redirect('/login');
        });
    }

    
    // render login page
    static renderLoginView(req, res) {
        res.render('./user/user_login_form');
    }

    
    // render register page
    static renderRegisterationView(req, res) {                
        res.render('./user/user_registeration_form');
    }

    
    // authenticate user login and create a session
    static async authenticateSession(req, res, next) {
        let {username, password} = req.body;
        username = username.trim();
        password = password.trim();
        try {
            if(username !== "" || password !== "") {
                const [userdata] = await pool.query('select id, password, username, email, about, profilepic from bd_user where username = :username', {username});
                if(userdata[0]) {
                    // bcrypt pwd compare logic goes here
                    const pwdMatched = await bcrypt.compare(password, userdata[0].password);

                    if(userdata[0] && username === userdata[0].username && pwdMatched) {
                        // delete all previous sessions. only session in current browser should persist
                        await pool.execute('delete from sessions where user_id=:userid', {userid: userdata[0].id});

                        // generate a jwt token to be expired in 2h
                        const token = jwt.sign({
                            userid: userdata[0].id

                        }, process.env.TOKEN_SECRET, {
                            expiresIn: 60 * 60 * 2
                        });
                        req.session.userinfo = {
                            username: userdata[0].username,
                            userid: userdata[0].id,
                            email: userdata[0].email,
                            about: userdata[0].about,
                            profilepic: userdata[0].profilepic,
                            loggedIn: true
                        }
                        // ensuring the session is saved explicitly before updating userid
                        await req.session.save();

                        // update sessions table and set userid as foreign key
                        await pool.execute('update sessions set user_id=:userid, token=:token where session_id=:sessid', {
                            userid: userdata[0].id,
                            token,
                            sessid: req.session.id
                        });

                        // set bearer token in httpOnly enabled cookie
                        res.cookie('bearer_token', token, {
                            httpOnly: true,
                            maxAge: new Date(Date.now() + 1000 * 60 * 60 * 2)
                        });
                        return res.status(200).json({
                            statusCode: 200,
                            token,
                            message: "User logged in successfully"
                        });

                    } else {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Incorrect credentials. Please try again"
                        });
                    }

                } else {
                    return res.status(400).json({
                        statusCode: 400,
                        message: "User is not registered. Please register first before proceeding"
                    });
                }

            } else {
                return res.status(400).json({
                    statusCode: 400,
                    message: "username and password cannot be empty"
                });
            }

        } catch (error) {
            return res.status(500).json({
                statusCode: 500,
                message: "Something went wrong. Please try again later"
            });
        } 
    }

    
    // register user
    static async registerUser(req, res, next) {
        let {email, username, password, confirmPassword} = req.body;
        email = email.trim();
        username = username.trim();
        password = password.trim();
        confirmPassword = confirmPassword.trim();
        
        try {
            if (email !== "" && username !== "" && password !== "" && confirmPassword !== "") {
                const exists = await pool.query('select id from bd_user where email = :email or username = :username', { email, username });

                if (exists[0].length === 0) {
                    if (password === confirmPassword) {
                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(password, salt);

                        await pool.execute(
                            `insert into bd_user 
                                (username, email, password, profilepic) 
                            values 
                                (:username, :email, :password, :profilepic)`,
                            { username, email, password: hash, profilepic: '/img/my-profile.svg' }
                        );

                        return res.status(201).json({
                            statusCode: 201,
                            message: "Congratulations! You have registered successfully on Blog-Dekho"
                        });

                    } else {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "password and confirm password do not match"
                        });
                    }

                } else {
                    return res.status(400).json({
                        statusCode: 400,
                        message: "User is already registered"
                    });
                }

            } else {
                return res.status(400).json({
                    statusCode: 400,
                    message: "username and password cannot be empty"
                });
            }

        } catch (error) {
            return res.status(500).json({
                statusCode: 500,
                message: "Something went wrong. Please try again later",
                error
            });
        }
    }
}

export default AuthController;