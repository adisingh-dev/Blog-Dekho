import express from 'express';
import BlogController from '../controllers/blog.controller.js'
import AutoBlogController from '../controllers/autoblog.controller.js';
import UserProfileController from '../controllers/userprofile.controller.js';
import {uploader} from '../middlewares/fileuploader.middleware.js';
import validateInput from '../middlewares/validateInput.js';
import checkInternet from '../middlewares/checkInternet.middleware.js';

const BlogsRouter = express.Router();

// API routes
BlogsRouter.get('/blogs', BlogController.getAllBlogs);
BlogsRouter.get('/subscriptions', UserProfileController.userSubscriptions);
BlogsRouter.get('/likes', UserProfileController.userLikes);
BlogsRouter.get('/blogs/:id', BlogController.getBlog);
BlogsRouter.get('/auto-blog', checkInternet, AutoBlogController.GenerateBlog);
BlogsRouter.get('/blogs/:id/shorts', BlogController.renderShortVideoPage);

BlogsRouter.post('/subscription', UserProfileController.toggleSubscription);
BlogsRouter.post('/likes', BlogController.toggleLikes);
BlogsRouter.post('/about', UserProfileController.aboutUser);

BlogsRouter.post('/blogs',
    checkInternet, 
    uploader.single('featured'),
    validateInput,
    BlogController.createBlog
);
BlogsRouter.post('/blogs/:id', 
    checkInternet, 
    uploader.single('featured'), validateInput, 
    BlogController.createBlog
);
BlogsRouter.post('/profile-image', 
    checkInternet, 
    uploader.single('userprofilepic'), 
    UserProfileController.profileImage
);
BlogsRouter.post('/auto-blog', 
    checkInternet, 
    AutoBlogController.AutoBlogDetails
);

BlogsRouter.post('/blogs/:id/shorts', BlogController.getShortVideos);

BlogsRouter.delete('/blogs/delete/:id', BlogController.deleteBlog)


export default BlogsRouter;