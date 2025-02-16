import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({path: path.join(import.meta.dirname, '../../.env')});
import session from 'express-session';
import mysql from 'mysql2/promise';
import MySQLStoreFactory from 'express-mysql-session';

console.log(import.meta);
const pool = await mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DB,
    user: process.env.USER,
    port: process.env.PORT,
    password: process.env.PASSWORD,
    namedPlaceholders: true
});
let MySQLStore = MySQLStoreFactory(session);

MySQLStore = new MySQLStore({
    createDatabaseTable: true,
    clearExpired: true,
    expiration: 7200000,
    checkExpirationInterval: 300000

}, pool);

const usersession = session({
    secret: process.env.SESS_KEY,
    resave: false,
    saveUninitialized: false,
    store: MySQLStore,
    cookie: {
        maxAge: 7200000
    }
});


export {pool, usersession};