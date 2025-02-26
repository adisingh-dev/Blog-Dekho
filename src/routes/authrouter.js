import express from 'express';
import BlogController from '../controllers/blog.controller.js'
import AuthController from '../controllers/auth.controller.js';
import validateInput from '../middlewares/validateInput.js';

const AuthRouter = express.Router();

// GET routes
AuthRouter.get('/error500', BlogController.routeToErrorPage);
AuthRouter.get('/destroyUserSession', AuthController.destroySession);
AuthRouter.post('/register', validateInput, AuthController.registerUser);
AuthRouter.post('/login', validateInput, AuthController.authenticateSession);

// POST routes
AuthRouter.get('/login', AuthController.renderLoginView);
AuthRouter.get('/register', AuthController.renderRegisterationView);


export default AuthRouter; 