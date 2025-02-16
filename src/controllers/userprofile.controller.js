import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.join(process.cwd(), '.env')});
import {pool} from '../db/config.js';
import { uploadToCloud } from '../middlewares/fileUpload.js';


class UserProfileController {

    // render user profile page
    static async renderProfileView(req, res) {
        return res.render('./user/user_profile', {
            responseJson: {
                userinfo: req.session.userinfo
            }
        });
    }


    // render subscribed channels
    static async renderAllSubscriptionsView(req, res) {
        let responseJson = {
            userinfo: req.session.userinfo
        };
        try {
            // get subscribed channels details
            const subscribedChannels = await pool.query(
                `select 
                    u.username, u.profilepic, count(s.id) as subscribers
                from bd_user u
                inner join bd_subscriptions s
                on u.id = s.subscribed_channel_id
                where u.id in (
                    select subscribed_channel_id 
                    from bd_subscriptions 
                    where subscribed_by = :subscribedby
                )
                group by u.username`, {
                subscribedby: req.session.userinfo.userid
            });
            responseJson.status = 200;
            responseJson.data = subscribedChannels[0];
            
        } catch (error) {
            responseJson.status = 500;
            responseJson.data = [];
        }
        return res.status(responseJson.status).render('./user/user_subscriptions', {responseJson});
    }


    // show liked blogs
    static async renderLikedBlogs(req, res) {
        let responseJson = {
            userinfo: req.session.userinfo
        };
        try {
            // get all liked blogs for the user
            const [likedBlogs] = await pool.query(
                `select 
                    bl.id, bl.title, bl.excerpt, bl.body, bl.img_url, bl.mode
                from bd_blogs_listing bl
                inner join
                bd_likes l
                on bl.id = l.liked_blog_id
                where l.liked_by = :likedby
                and l.liked_blog_id is not null
                and l.liked_user_id is not null
                order by l.id desc`, {
                likedby: req.session.userinfo.userid
            });
            responseJson.status = 200;
            responseJson.blogs = likedBlogs;

        } catch (error) {
            responseJson.status = 500;
            return res.redirect('error500');
        }
        return res.status(responseJson.status).render('./user/user_liked_blogs', {responseJson});
    }


    // toggle subscribed channel
    static async toggleSubscription(req, res) {
        const {creatorId} = req.body;
        let responseJson = {};
        try {
            // check if the blog is subscribed by the user
            const [out] = await pool.query('select id from bd_subscriptions where subscribed_by = :subscribedby and subscribed_channel_id = :subscribedchannel', {
                subscribedby: req.session.userinfo.userid,
                subscribedchannel: parseInt(creatorId)
            });

            if(out[0]?.id) {
                // if following the channel then unfollow by deleting the row from database
                await pool.query('delete from bd_subscriptions where subscribed_by = :subscribedby and subscribed_channel_id = :subscribedchannel', {
                    subscribedby: req.session.userinfo.userid,
                    subscribedchannel: parseInt(creatorId)
                });
                responseJson.subscribed = false;
                
            } else {
                // if not following then follow the channel by inserting a row in database
                await pool.query('insert into bd_subscriptions (subscribed_by, subscribed_channel_id) values (:subscribedby, :subscribedchannel)', {
                    subscribedby: req.session.userinfo.userid,
                    subscribedchannel: parseInt(creatorId)
                });
                responseJson.subscribed = true;
            }
            // get subscription count after toggle 
            const [totalsubscribers] = await pool.query('select count(*) as subs from bd_subscriptions where subscribed_channel_id = :subscribedchannel', {
                subscribedchannel: creatorId
            });
            responseJson.status = 200;        
            responseJson.totalsubscribers = totalsubscribers[0].subs;

        } catch(error) {
            responseJson.status = 500;
            responseJson.message = "Something went wrong. Could not toggle subscription. Please try again later"
        }
        res.status(responseJson.status).json(responseJson);
    }


    // update user profile image
    static async profileImage(req, res) {
        let responseJson = {};
        try {
            if(req.file) {
                // call to file upload middleware
                const uploadRes = await uploadToCloud(req);

                // if received an error then block the upload 
                if(uploadRes.status == 500) throw uploadRes;

                // update database with secureUrl of the asset
                await pool.execute('update bd_user set profilepic = :profilepic where id = :userid', {
                    userid: req.session.userinfo.userid,
                    profilepic: uploadRes.secureUrl
                });
                req.session.userinfo.profilepic = uploadRes.secureUrl;
                responseJson.status = 201;
                responseJson.message = uploadRes.message;
                responseJson.imgUrl = uploadRes.secureUrl;

            } else {
                responseJson.status = 500;
                responseJson.message = uploadRes.message;
            }
            
        } catch (error) {
            responseJson.status = 500;
            responseJson.message = 'something went wrong';
        }
        res.status(responseJson.status).json(responseJson);
    }


    static async aboutUser(req, res) {
        const {content} = req.body;
        let responseJson = {};
        try {
            await pool.execute('update bd_user set about = :contt where id = :userid', {
                userid: req.session.userinfo.userid, content
            });
            responseJson.status = 201;
            responseJson.message = "About section updated successfully!";
            req.session.userinfo.about = content;

        } catch (error) {
            responseJson.status = 500;
            responseJson.message = "*Something went wrong. About section could not be updated";
        }
        res.status(responseJson.status).json(responseJson);
    }
}

export default UserProfileController;