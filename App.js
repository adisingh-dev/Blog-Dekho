import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({path: path.join('/', '.env')});

import express from 'express'
import cors from 'cors';
import {usersession} from './src/db/config.js';
import router from './src/routes/router.js';
import Auth from './src/middlewares/auth.middleware.js';
import AuthRouter from './src/routes/authrouter.js';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, './src/views'));

app.use(cors());
app.use(usersession);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(import.meta.dirname, 'src', 'public', 'assets')));
app.use(express.static(path.join(import.meta.dirname, 'src', 'public')));
app.use('/tinymce', express.static(path.join(import.meta.dirname, 'node_modules', 'tinymce')));

app.use(AuthRouter);
app.use(Auth);
app.use(router);

app.get("*", (req, res) => {
    res.send('404 Not Found! The resource you are looking does not exist. Please try again later');
});
app.listen(process.env.SERVER_PORT, () => console.log(`server running @${process.env.SERVER_PORT}`));