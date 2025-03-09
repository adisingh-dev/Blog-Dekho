import jwt from 'jsonwebtoken';
import axios from 'axios'


const Auth = async (req, res, next) => {
    try {
        const bearertoken = req.cookies.bearer_token;
        const tokendata = jwt.verify(bearertoken, process.env.TOKEN_SECRET);
        
        return (req.url == '/login' || req.url == '/register')? 
        res.status(200).redirect('/home'): 
        next();

    } catch (err) {
        if(req.url.startsWith("/api/v1/")) {
            const error = new Error('Invalid token. Unauthorized access');
            error.statusCode = 401;
            return next(error);
            
        } else {
            if(req.url == '/login' || req.url == '/register') return next();
            await axios.delete(
                `http://${process.env.HOST}:${process.env.SERVER_PORT}/api/v1/destroy-session`, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            return res.status(200).redirect('/login');
        }
    }
}

export default Auth;