# Project Blog-Dekho
Blog-Dekho is a server side content creation app that provides automation to create blogs using AI and schedule the blog upload at a desired time and date using cron job
<img width="947" alt="Image" src="https://github.com/user-attachments/assets/cad7c8fe-ea64-4ac1-94e3-e2118fe158bd" />
<img width="959" alt="Image" src="https://github.com/user-attachments/assets/c6267d54-2717-4399-a3b2-f89371a79390" />
<div align="center">
  <img width="400" alt="Image" src="https://github.com/user-attachments/assets/aa29730b-2c8d-41d7-94a5-88b4007c6fe8" />
  <img width="400" alt="Image" src="https://github.com/user-attachments/assets/10405059-361d-4c55-9735-6871c94a2ef6" />
</div>
<img width="959" alt="Image" src="https://github.com/user-attachments/assets/5aa08e78-f311-493a-a279-fb24ea81b07b" />
<img width="959" alt="Image" src="https://github.com/user-attachments/assets/166ee03c-7c3a-4224-841e-603e5efddeac" />

## Tech Stack
Javascript, NodeJS, ExpressJS, MySQL Database, EJS template engine, CSS

## Features
* __CRUD__ operations to manage a blog
* __File Upload__ on cloudinary for user profile avatar image
* Provides a __tool__ to __create blog__ automatically __using AI__
* Real time updates for blog creation using __Server Sent Events__
* __Cron Job__ to schedule blog post
* Contains both, session based User authentication and authorization using __JWT token__

## API Documentation: [Postman Link](https://documenter.getpostman.com/view/42771315/2sAYdoG7wg) <img width="30" style="margin-top:1rem" alt="Image" src="https://github.com/user-attachments/assets/913f691c-0aa3-4fb7-8b2c-21e9ccb3c6fd" />

## Installation Steps

**1.  Clone the Repository:**
  ```bash
  mkdir projectFolder
  cd projectFolder
  git clone [repository URL]
  cd Blog-Dekho
  ```

**2.  Install Dependencies:**
* Open VS Code terminal and type following command to install all dependencies in package.json
* For Node.js (npm or yarn):
    
  ```bash
  npm install or, npm i  # or yarn install
  ```

**3. Configuration:**
* Set up dotenv file in root folder of the project
  ```bash
  touch .env
  ```

* Edit the `.env` file and fill in the following required variables. (Set them according to your Database and API configuration)

  ```bash
      HOST: The hostname or IP address the application should bind to
      DB: Database name
      USER: Database username
      PASSWORD: Database password
      PORT: Database port number
      SERVER_PORT: Port number the node application listens on
      SESS_KEY: Secret key used for session management
      TOKEN_SECRET: Secret key used for JWT token signing
      CLD_INSTANCE: Cloudinary instance name
      CLD_KEY: Cloudinary API key
      CLD_SECRET: Cloudinary API secret
      AI_KEY: Gemini API key for AI service
      AI_BLOG_TITLE_PROMPT: Prompt used to generate blog titles with AI
      AI_BLOG_EXCERPT_PROMPT: Prompt used to generate blog excerpts with AI
      AI_BLOG_DESCRIPTION_PROMPT: Prompt used to generate blog descriptions with AI
      TOGETHER_AI_KEY: API key for the Together-AI service
      IMAGE_AUTO_PROMPT: Default prompt used for automated image generation
  ```

**4. Database Setup:**
* This project is built on top of MySQL database. so configure your mysql client accordingly
* The schema for all required tables is provided in this file
    
  ```bash
  /src/db/schema/create_tables.sql
  ```
    
 * login with your mysql user and import the create_tables.sql file

  ```bash
  mysql -u <db_username> -p <db_password>
  create database blog_dekho;
  source < path_to_create_tables.sql >;
  ```
      

**5. Running the Application:**
* As nodemon package is installed as dev dependency in NodeJs environment, simply run:
  ```bash
  npm run dev # or yarn dev
  ```
