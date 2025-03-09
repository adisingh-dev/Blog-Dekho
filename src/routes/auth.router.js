import express from 'express';
import BlogController from '../controllers/blog.controller.js'
import AuthController from '../controllers/auth.controller.js';
import validateInput from '../middlewares/validateInput.js';

const AuthRouter = express.Router();

// API routes
AuthRouter.post('/register', 
    validateInput, 
    AuthController.registerUser
);

AuthRouter.post('/login', 
    validateInput, 
    AuthController.authenticateSession
);

AuthRouter.delete('/destroy-session', 
    AuthController.destroySession
);


export default AuthRouter; 