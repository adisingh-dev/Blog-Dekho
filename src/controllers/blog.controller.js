import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.join(process.cwd(), '.env')});
import axios from 'axios';
import {pool} from '../db/config.js';
import {uploadToCloud} from '../middlewares/fileuploader.middleware.js';

class BlogController {

    // fetch all blogs for index page
    static async getAllBlogs(req, res) {
        let responseJson = {
            userinfo: req.session.userinfo
        };
        try {
            const [blogs] = await pool.query(
                `select id, title, body, excerpt, img_url, mode from bd_blogs_listing order by updated_at desc`
            );
            responseJson.status = 200;
            responseJson.blogs = blogs;
            responseJson.pattern = "";
            
        } catch (err) {
            return res.status(500).redirect('error500');
        }
        return res.status(responseJson.status).render('./blog/index', {responseJson});
    }


    // manually create blog
    static async createBlog(req, res) {
        let params = req.body;
        let toUpload=true;
        let query = "";
        
        try {
            // blog-id present: request for update blog
            if(req.params.id) {
                params.id = req.params.id;
                let [data] = await pool.query(`select img_url from bd_blogs_listing where id=:id`, {id: params.id});

                // avoid reuploading same img. if given url already exist on db it means same img was uploaded before
                query = 'update bd_blogs_listing set title=:title, body=:body, excerpt=:excerpt, updated_at=now()';
                if(data.length == 1 && data[0].img_url == params.featured) {
                    toUpload = false;

                } else {
                    query += 'img_url=:imgUrl ';
                }
                query += ' where id=:id';
                
            // blog-id missing: request to insert blog
            } else {
                query = 'insert into bd_blogs_listing (userid, title, body, excerpt, mode, img_url) values(:userid, :title, :body, :excerpt, :mode, :imgUrl)';
                params.userid = req.session.userinfo.userid;
            }            

            if(toUpload) {
                // handle img upload to cloudinary and throw error if error encountered
                const imgupload = await uploadToCloud(req);
                if(imgupload.status === 500) throw imgupload;
                params.imgUrl = (imgupload?.secureUrl)? imgupload.secureUrl: "";
            }
            await pool.execute(query, params);
            
        } catch (error) {
            return res.status(500).json({
                userinfo: req.session.userinfo,
                message: error
            });
        }
        return res.status(201).json({
            userinfo: req.session.userinfo,
            message: "Your Blog has been Blog created successfully!"
        });
    }


    // render blog content page
    static async readBlog(req, res) {
        const {id} = req.params;
        let responseJson = {
            userinfo: req.session.userinfo
        };
        try {
            // fetch blog details
            const [blog] = await pool.query(
                `select 
                    userid, date_format(bl.updated_at, "%d %M, %Y") as date_of_creation,
                    bl.title, bl.body, bl.img_url
                from bd_blogs_listing bl
                where bl.id = :id`, {id}
            );
            // get author details
            const [creator] = await pool.query('select u.id, u.username, u.profilepic from bd_user u where id = :creatorid', {creatorid: blog[0].userid});
            
            // get subscriber count
            const [totalsubs] = await pool.query('select count(*) as subs from bd_subscriptions where subscribed_channel_id = :creatorid', {
                creatorid: creator[0].id
            });

            // get subscribe/unsubscribe status
            const [following] = await pool.query(`select id from bd_subscriptions where subscribed_by = :userid and subscribed_channel_id = :creatorid`, {
                userid: req.session.userinfo.userid,
                creatorid: creator[0].id
            });

            // get total likes count for blog
            const [totallikes] = await pool.query('select count(*) as likes from bd_likes where liked_blog_id = :blogid', {
                blogid: id
            });

            // get liked/unlike status
            const [liked] = await pool.query('select id from bd_likes where liked_by = :userid and liked_blog_id = :likedblogid', {
                userid: req.session.userinfo.userid,
                likedblogid: id
            });

            responseJson.status = 200;
            responseJson.creatorinfo = {
                username: creator[0].username,
                profilepic: creator[0].profilepic,
                subscribers: blog[0].subscribers,
                dateOfCreation: blog[0].date_of_creation,
                id: creator[0].id,
                subscribed: (following[0]?.id)? true: false,
                subscribers: totalsubs[0].subs,
                liked:  (liked[0]?.id)? true: false,
                likes: totallikes[0].likes
            };
            responseJson.blog = {
                id: id,
                imgUrl: blog[0].img_url,
                title: blog[0].title,
                body: blog[0].body
            };
            
        } catch (error) {
            responseJson.status = 500;
            responseJson.message = "something went wrong";
        }
        res.status(responseJson.status).render('./blog/read_blog', {responseJson});
    }


    // toggle user like button
    static async toggleLikes(req, res) {
        const {creatorId, blogId} = req.body;
        let responseJson = {};
        try {
            // check if blog post already liked by same user
            const [out] = await pool.query('select id from bd_likes where liked_by = :likedby and liked_user_id = :likeduserid and liked_blog_id = :likedblogid', {
                likedby: req.session.userinfo.userid,
                likeduserid: creatorId,
                likedblogid: blogId
            });
            
            if(out[0]?.id) {
                // if liked then unlike the post
                await pool.query('delete from bd_likes where liked_by = :likedby and liked_user_id = :likeduserid and liked_blog_id = :likedblogid', {
                    likedby: req.session.userinfo.userid,
                    likeduserid: creatorId,
                    likedblogid: blogId
                });
                responseJson.liked = false;
                
            } else {
                // elseif unliked then like the post
                await pool.query('insert into bd_likes (liked_by, liked_user_id, liked_blog_id) values (:likedby, :likeduserid, :likedblogid)', {
                    likedby: req.session.userinfo.userid,
                    likeduserid: creatorId,
                    likedblogid: blogId
                });
                responseJson.liked = true;
            }
            // get total likes for blog post after toggle
            let [likes] = await pool.query('select count(*) as totallikes from bd_likes where liked_user_id = :likeduserid and liked_blog_id = :likedblogid', {
                likeduserid: creatorId,
                likedblogid: blogId
            });
            responseJson.status = 200;
            responseJson.likes = likes[0].totallikes;

        } catch (error) {
            responseJson.status = 500;
            responseJson.message = "Something went wrong. Could not toggle the like";
        }
        res.status(responseJson.status).json(responseJson);
    }


    // method to render shorts vid page ==>> upcoming future
    static async renderShortVideoPage(req, res) {
        res.render('./blog/short_videos', {
            blog: {
                id: req.params.id,
                vidBaseUrl: process.env.VID_BASE
            }
        });
    }


    // get youtube shorts related to the blog ==>> upcoming feature 
    static async getShortVideos(req, res) {
        const {id} = req.params;
        
        let out = {};
        try {
            const [blog] = await pool.query('select title from bd_blogs_listing where id=:id', {id});            
            const url = process.env.VID_SEARCH;
            const {data} = await axios.get(url, {
                params: {
                    part: 'snippet',
                    maxResults: 500,
                    type:'video',
                    videoDuration:'short',
                    q: `${'iron man'} shorts`,
                    key: process.env.VID_KEY
                }
            });
            out.status = 200;
            out.title = blog[0].title;

            // set nextPageToken in response for calling api in batches
            out.nextPageToken = data.nextPageToken;
            out.videoids = [];
            out.videoids = data.items.map(item => {
                return item.id.videoId;
            });
            for(let i = out.videoids.length - 1; i > 0; i--) {
                const randIdx = ( Math.floor( Math.random() * (i + 1) ) );
                [out.videoids[randIdx], out.videoids[i]] = [out.videoids[i], out.videoids[randIdx]];
            }

        } catch (error) {
            out.status = 500;
            out.msg = 'something went wrong';
        }   
        res.status(out.status).json(out);
    }


    // pattern matching for search feature
    static async searchBlog(req, res) {
        let {pattern} = req.query;
        let responseJson = {
            userinfo: req.session.userinfo
        };
        pattern = pattern.replace(/\s+/g, " ");
        pattern = pattern.split(" ");
        pattern = pattern.join("");
        pattern = pattern.toLowerCase();

        try {
            const [blogs] = await pool.query(
                `select * from bd_blogs_listing where
                lower(regexp_replace(title, '\\\\s+', '')) like :pattern 
                or lower(regexp_replace(excerpt, '\\\\s+', '')) like :pattern`,
                {pattern: `%${pattern}%`}
            );
            responseJson.status = 200;
            responseJson.blogs = blogs;
            responseJson.pattern = pattern;

        } catch (error) {
            return res.status(500).redirect('error500');
        }
        return res.status(responseJson.status).render('./blog/index', {responseJson});
    }


    // delete a blog ==>> upcoming feature
    static async deleteBlog(req, res) {
        const {id} = req.params;
        let responseJson = {};
        try {
            const [data] = await pool.query(
                `delete from bd_blogs_listing where id = :id`, {id}
            );
            responseJson.status = 200;
            responseJson.msg = "Blog deleted successfully";

        } catch (error) {
            return res.status(500).redirect('error500');
        }
        return res.status(responseJson.status).json(responseJson);
    }


    // blog details for form to manually create blog
    static async blogForm(req, res) {
        let responseJson = {
            userinfo: req.session.userinfo
        };
        if(req.params.id) {
            try {
                // get blog details while updating the blog or leave empty while creating blog 
                const [data] = await pool.query(
                    `select * from bd_blogs_listing where id = :id`,
                    {id: req.params.id}
                );
                responseJson.status = 200;
                responseJson.blog = data[0];
                
            } catch (error) {
                return res.status(500).redirect('error500');
            }
        } else {
            responseJson.status = 200;
            responseJson.blog = {};
        }
        return res.status(responseJson.status).render('./blog/create_blog', {responseJson});
    }


    // render auto blog create form
    static bdCreateBlogPage(req, res) {
        return res.status(200).render('./blog/auto_create_blog', {
            responseJson: {
                userinfo: req.session.userinfo,
            }
        });
    }


    // render an error page on invalid redirection
    static routeToErrorPage(req, res) {
        res.render('./error_500');
    }
}


export default BlogController;