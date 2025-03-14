import fs from 'node:fs';
import path from 'node:path';
import {pool} from '../db/config.js';
import cron from 'node-cron';
import {v2 as cloudinary} from 'cloudinary';
import {GoogleGenerativeAI} from '@google/generative-ai';
import Together from "together-ai";


class AutoBlogController{

    static async AutoBlogDetails(req, res) {
        let responseJson = {};
        try {
            // do not process input if given date is less than given date
            const diff = new Date(`${req.body.scheduledOn} ${req.body.scheduledAt}`) - new Date();
            if(diff <= 0) {
                throw "Schedule time and date cannot be less than or equal to current time!";
            }
            await pool.execute('insert into bd_auto_post_details (user_id, keywords, scheduled_at, scheduled_on, updated_at, created_at) values (:user_id, :keywords, :scheduled_at, :scheduled_on, NOW(), NOW())', {
                user_id: req.session.userinfo.userid,
                keywords: req.body.keywords,
                scheduled_at: req.body.scheduledAt,
                scheduled_on: req.body.scheduledOn
            });
            responseJson.status = 201;
            responseJson.inputCaptured = true;
            
        } catch (error) {
            responseJson.status = (typeof error == 'string')? 400: 500;
            responseJson.inputCaptured = false;
            responseJson.message = (typeof error == 'string')? error: "Something went wrong. Please try again later";
        }
        res.status(responseJson.status).json(responseJson);
    }
    

    static async GenerateBlog(req, res) {
        res.set({
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        });
        res.on('close', () => {
            res.end();
        });
        try {
            const [autoBlogData] = await pool.query(
                `select keywords, scheduled_at, scheduled_on 
                from bd_auto_post_details 
                where user_id = :user_id 
                order by updated_at desc limit 1`, {
                user_id: req.session.userinfo.userid
            });

            // create a cron expression for given time
            // input: 15:23 (24-hr format), 2024-10-17 (yyyy-mm-dd)
            // output: 23 15 17 10 *
            // query: year setting in cron expression?
            let at = autoBlogData[0].scheduled_at;
            const date = new Date(autoBlogData[0].scheduled_on);
            let on = date.toLocaleString('en-GB',{
                weekday: 'short',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });     
            let cronExp = `${at[3]}${at[4]} ${at[0]}${at[1]} ${on[5]}${on[6]} ${on[8]}${on[9]} *`;
            
            // integrate Google Gemini Api and generate content through relevant prompts
            const genAi = new GoogleGenerativeAI(process.env.AI_KEY);
            res.write("data: Ai configuration setup complete\n\n");

            // temperature controls the randomness of the output
            // higher values = creative/unpredictable response
            // lower values = deterministic/factual response
            // range = [0.0, 2.0] default 0.7
            // generate a temperature in range [0 - 1.1] for randomizing blog content when feeded with same inputs
            const temperature = (Math.floor(Math.random() * 1000 + 1) % 12) / 10;
            
            // configure gemini
            const model = genAi.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature
                }
            });

            // generate blog title
            const aiBlogTitle = await model.generateContent(`${process.env.AI_BLOG_TITLE_PROMPT} ${autoBlogData[0].keywords}`);
            res.write("data: Generated Blog title\n\n");

            // generate blog excerpt
            const aiBlogExcerpt = await model.generateContent(`${process.env.AI_BLOG_EXCERPT_PROMPT} ${aiBlogTitle.response.text()}`);
            res.write("data: Generated Blog Excerpt\n\n");

            // generate blog content
            const aiBlogDescription = await model.generateContent(`${process.env.AI_BLOG_DESCRIPTION_PROMPT} ${aiBlogTitle.response.text()}`);
            res.write("data: Generated Blog Description\n\n");
            
            // generate blog thumbnail using AI integration
            const aiAutoImgText = await model.generateContent(`${process.env.IMAGE_AUTO_PROMPT} ${aiBlogDescription.response.text()}`);
            const together = new Together({
                apiKey: process.env.TOGETHER_AI_KEY
            });
            // configure blog image generation using AI
            const response = await together.images.create({
                model: "black-forest-labs/FLUX.1-schnell-Free",
                prompt: aiAutoImgText.response.text(),
                width: 800,
                height: 512,
                steps: 4,
                n: 4,
                response_format: "b64_json"
            });
            const imagebuffer = Buffer.from(response.data[0].b64_json, 'base64');
            const aiImageFile = path.join('src', 'public', 'assets', 'uploads', `${`blog_dekho_ai_thumbnail_${new Date().getTime()}`}.webp`);
            fs.writeFileSync(aiImageFile, imagebuffer);
            res.write("data: Blog thumbnail graphic image generated\n\n");
            
            // upload newfound img asset to cloud
            cloudinary.config({ 
                cloud_name: process.env.CLD_INSTANCE, 
                api_key: process.env.CLD_KEY, 
                api_secret: process.env.CLD_SECRET
            });
            const {secure_url} = await cloudinary.uploader.upload(aiImageFile, {folder: 'featured'});
            fs.unlinkSync(aiImageFile);
            res.write("data: Uploaded graphic asset on cloudinary\n\n");


            // check whether scheduled time goes less than current time while creating the blog
            let formattedScheduledDate = new Date(autoBlogData[0].scheduled_on);
            autoBlogData[0].scheduled_at = autoBlogData[0].scheduled_at.split(':');
            const [hours, minutes, seconds] = autoBlogData[0].scheduled_at.map(number => number);
            formattedScheduledDate.setHours(
                formattedScheduledDate.getHours() + hours,
                formattedScheduledDate.getMinutes() + minutes,
                formattedScheduledDate.getSeconds() + seconds
            );
            const formattedScheduledTimeInMs = formattedScheduledDate.getTime();
            const diff = formattedScheduledTimeInMs - new Date();

            if(diff <= 0) {
                res.write("event: error\n");
                res.write("data: current time surpassed scheduled time while creating the blog. Please try again! \n\n");

            } else {
                // push the generated data on our db
                const task = cron.schedule(cronExp, async () => {
                    const blogtitle = aiBlogTitle.response.text();
                    const blogdescription = aiBlogDescription.response.text();
                    const blogexcerpt = aiBlogExcerpt.response.text();
                    if(blogtitle && blogdescription && blogexcerpt) {
                        await pool.execute(
                            'insert into bd_blogs_listing (userid, title, body, excerpt, img_url, mode) values (:userid, :title, :body, :excerpt, :imgUrl, :mode)', {
                                userid: req.session.userinfo.userid,
                                title: blogtitle,
                                body: blogdescription,
                                excerpt: blogexcerpt,
                                imgUrl: secure_url,
                                mode: 'auto'
                            }
                        );
                    }
                    res.write("event: close\n");
                    res.write("data: Updated the database\n\n");
                    task.stop();
                });

                // process ends here
                res.write("data: Finished! Your blog has been created successfully\n\n");
            }
            
        } catch (error) {
            res.write("event: error\n");
            res.write("data: Some error occured while processing the request. Please try again later\n\n");
        }
    }
}

export default AutoBlogController;