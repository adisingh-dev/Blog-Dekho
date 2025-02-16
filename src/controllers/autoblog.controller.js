import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({path: path.join(process.cwd(), '.env')});
import {GoogleGenerativeAI} from '@google/generative-ai';
import cron from 'node-cron';
import puppeteer from 'puppeteer';
import {pool} from '../db/config.js';
import {v2 as cloudinary} from 'cloudinary';


class AutoBlogController{
    static clients = [];

    static async AutoBlogDetails(req, res) {
        try {
            await pool.execute('insert into bd_auto_post_details (user_id, keywords, scheduled_at, scheduled_on, updated_at, created_at) values (:user_id, :keywords, :scheduled_at, :scheduled_on, NOW(), NOW())', {
                user_id: req.session.userinfo.userid,
                keywords: req.body.keywords,
                scheduled_at: req.body.scheduledAt,
                scheduled_on: req.body.scheduledOn
            });
            res.status(201).json({
                status: 201,
                inputCaptured: true
            });
            
        } catch (error) {
            res.status(500).json({
                status: 500,
                inputCaptured: false
            });
        }
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
            let at = autoBlogData[0].scheduled_at, on = autoBlogData[0].scheduled_on;
            let cronExp = `${at[3]}${at[4]} ${at[0]}${at[1]} ${on[8]}${on[9]} ${on[5]}${on[6]} *`;

            
            // integrate Google Gemini Api and generate content through relevant prompts
            const genAi = new GoogleGenerativeAI(process.env.AI_KEY);
            res.write("data: Ai configuration setup complete\n\n");

            // temperature controls the randomness of the output
            // higher values = creative/unpredictable response
            // lower values = deterministic/factual response
            // range = [0.0, 2.0] default 0.7
            // generate a temperature in range [0 - 1.2] for randomizing blog content when feeded with same inputs
            const temperature = (Math.floor(Math.random() * 1000 + 1) % 13) / 10;
            
            // configure gemini
            const model = genAi.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature
                }
            });

            // let c =0;
            // const customprocess = setInterval(() => {
            //     if(c > 6) {
            //         clearInterval(customprocess);
            //         res.write("event: close\n");
            //         res.write("data: Finished! Your blog has been created successfully\n\n");
            //         // BlogAutomationController.clients.pop();

            //         // return res.status(200).json({
            //         //     blogGenerated: true
            //         // });
            //     }
            //     if(c==1) res.write("data: Generating Blog title\n\n");
            //     if(c==2) res.write("data: Generating Blog Excerpt\n\n");
            //     if(c==3) res.write("data: Generating Blog Description\n\n");
            //     if(c==4) res.write("data: Fetching a featured graphic/thumbnail\n\n");
            //     if(c==5) res.write("data: Uploading graphic asset on cloudinary\n\n");
            //     if(c==6) res.write("data: Updating the database\n\n");
            //     c++;

            // }, 2000);

            const aiBlogTitle = await model.generateContent(`${process.env.AI_BLOG_TITLE_PROMPT} ${autoBlogData[0].keywords}`);
            res.write("data: Generated Blog title\n\n");

            const aiBlogExcerpt = await model.generateContent(`${process.env.AI_BLOG_EXCERPT_PROMPT} ${autoBlogData[0].keywords}`);
            res.write("data: Generated Blog Excerpt\n\n");

            const aiBlogDescription = await model.generateContent(`${process.env.AI_BLOG_DESCRIPTION_PROMPT} ${autoBlogData[0].keywords}`);
            res.write("data: Generated Blog Description\n\n");

            const aiAutoImgText = await model.generateContent(`${process.env.IMAGE_AUTO_PROMPT} ${autoBlogData[0].keywords}`);
            console.log('img text: ', aiAutoImgText.response.text());
            
            // configure puppeteer for headless browser automation
            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();

            // set navigation timeout to 1min in case of poor network conditions
            page.setDefaultNavigationTimeout(60000);

            // browse pinterest url to get quality images
            await page.goto(`${process.env.IMAGE_BASE_URL}${aiAutoImgText.response.text()}`, {waitUntil: 'networkidle2'});

            let imageSrc = await page.evaluate(async () => {
                // store unique img URLs because pinterest lazy loads all images so it
                // causes repeatition of same image links everytime window is scrolled
                let images = new Set();

                while (images.size < 50) {
                    window.scrollBy(0, window.innerHeight);

                    // wait for 1sec to allow lazy loading
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const imgElements = document.querySelectorAll('img');
                    imgElements.forEach(img => {
                        if (img.width > 60 && img.height > 60 && img.width !== img.height) {
                            images.add(img.src);
                        }
                    });
                }
                images = Array.from(images);
                let randindx = Math.floor(Math.random() * images.length);
                console.log('images: ', images);
                console.log('randindx: ', randindx);
                return images[randindx];
            });
            res.write("data: Fetched a featured graphic/thumbnail\n\n");

            
            // upload newfound img asset to cloud
            cloudinary.config({ 
                cloud_name: process.env.CLD_INSTANCE, 
                api_key: process.env.CLD_KEY, 
                api_secret: process.env.CLD_SECRET
            });
            const {secure_url} = await cloudinary.uploader.upload(imageSrc, {folder: 'featured'});
            res.write("data: Uploaded graphic asset on cloudinary\n\n");


            // push the generated data on our db
            const finale = await pool.execute(
                'insert into bd_blogs_listing (userid, title, body, excerpt, img_url, mode) values (:userid, :title, :body, :excerpt, :imgUrl, :mode)', 
                {
                    userid: req.session.userinfo.userid,
                    title: aiBlogTitle.response.text(), 
                    body: aiBlogDescription.response.text(),
                    excerpt: aiBlogExcerpt.response.text(),
                    imgUrl: secure_url,
                    mode: 'auto'
                }
            );
            res.write("data: Updated the database\n\n");

            // process ends here
            console.log(`title: ${aiBlogTitle.response.text()}`);
            console.log(`excerpt: ${aiBlogExcerpt.response.text()}`);
            console.log(`body: ${aiBlogDescription.response.text()}`);
            console.log(`image: ${imageSrc}`);
            res.write("event: close\n");
            res.write("data: Finished! Your blog has been created successfully\n\n");
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                blogGenerated: false
            });
        }

    }
}

export default AutoBlogController;