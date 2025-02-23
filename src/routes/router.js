import express from 'express';
import BlogController from '../controllers/blog.controller.js'
import AutoBlogController from '../controllers/autoblog.controller.js';
import AuthController from '../controllers/auth.controller.js';
import UserProfileController from '../controllers/userprofile.controller.js';
import {uploader} from '../middlewares/fileUpload.js';
import resetUrl from '../middlewares/resetUrl.js';
import validateInput from '../middlewares/validateInput.js';
import checkInternet from '../middlewares/checkInternet.js';

const router = express.Router();

// router.post('/schedule_blog_post', validateInput, AutoBlogController.GenerateBlog);

// GET requests
// route to error pg in case of incorrect url
router.get('/error500', BlogController.routeToErrorPage);
router.get('/destroyUserSession', AuthController.destroySession);
router.post('/register', validateInput, AuthController.registerUser);
router.post('/login', validateInput, AuthController.authenticateSession);

router.use(AuthController.sessionHandler);

router.get('/login', AuthController.renderLoginView);
router.get('/register', AuthController.renderRegisterationView);
router.get('/blogs', resetUrl, BlogController.getAllBlogs);
router.get('/blogs/:id', BlogController.readBlog);
router.get('/blogs/:id/shorts', BlogController.renderShortVideoPage);
router.get('/search_blog', BlogController.searchBlog);
router.get('/create_blog', BlogController.blogForm);
// get update pg with prefilled resource 
router.get('/create_blog/:id', BlogController.blogForm);

// get user profile pg
router.get('/user_profile', UserProfileController.renderProfileView);
router.get('/all_subscriptions', UserProfileController.renderAllSubscriptionsView);
router.get('/liked_blogs', UserProfileController.renderLikedBlogs);

// automate job
router.get('/automate', BlogController.bdCreateBlogPage);
router.get('/stream_blog_updates', checkInternet, AutoBlogController.GenerateBlog);


// POST Routes
router.post('/blogs', checkInternet, uploader.single('featured'), validateInput, BlogController.createBlog);
router.post('/toggle-subscription', UserProfileController.toggleSubscription);
router.post('/toggle-likes', BlogController.toggleLikes);
router.post('/about', UserProfileController.aboutUser);


// update blog
router.post('/blogs/:id', checkInternet, uploader.single('featured'), validateInput, BlogController.createBlog);
router.post('/userprofilepic', checkInternet, uploader.single('userprofilepic'), UserProfileController.profileImage);
router.post('/blogs/:id/shorts', BlogController.getShortVideos);
router.post('/auto_blog_data', checkInternet, validateInput, AutoBlogController.AutoBlogDetails);


// DELETE Routes
router.delete('/blogs/delete/:id', BlogController.deleteBlog)


export default router; 