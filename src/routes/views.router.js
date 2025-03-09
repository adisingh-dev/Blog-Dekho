import express from 'express';
import BlogController from '../controllers/blog.controller.js'
import AuthController from '../controllers/auth.controller.js';
import UserProfileController from '../controllers/userprofile.controller.js';

const ViewsRouter = express.Router();

// View routes
ViewsRouter.get('/home', BlogController.homePage);
ViewsRouter.get('/read-blog/:id', BlogController.renderBlog);

ViewsRouter.get('/compose', BlogController.renderBlogForm);
ViewsRouter.get('/compose/:id', BlogController.renderBlogForm);

ViewsRouter.get('/user-subscriptions', UserProfileController.renderAllSubscriptionsView);
ViewsRouter.get('/liked-blogs', UserProfileController.renderLikedBlogs);

ViewsRouter.get('/user-profile', UserProfileController.renderProfileView);
ViewsRouter.get('/auto-compose', BlogController.bdCreateBlogPage);

ViewsRouter.get('/error500', BlogController.routeToErrorPage);

ViewsRouter.get('/login', AuthController.renderLoginView);
ViewsRouter.get('/register', AuthController.renderRegisterationView);


export default ViewsRouter;