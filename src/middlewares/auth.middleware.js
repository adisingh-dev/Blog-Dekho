import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({path: path.join('/', '.env')});

import jwt from 'jsonwebtoken';


const Auth = async (req, res, next) => {
    try {
        const cookie = req.headers.cookie;
        const cookiename = 'bearer_token';
        const startidx = cookie.indexOf('bearer_token') + cookiename.length + 1;
        let bearertoken = "";
        for(let i = startidx; i < cookie.length; i++) {
            if(cookie[i] == ';') break;
            bearertoken += cookie[i];
        }
        const tokendata = jwt.verify(bearertoken, process.env.TOKEN_SECRET);
        next();

    } catch (error) {
        return res.redirect('/destroyUserSession');
    }
}

export default Auth;