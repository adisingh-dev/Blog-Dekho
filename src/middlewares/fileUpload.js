import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import path from 'node:path';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';


const validateUpload = (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const extension = path.extname(file.originalname);
    
    if(allowedExtensions.includes(extension)) {
        cb(null, true);

    } else {
        cb(null, false);
    }
}

const storage = multer.memoryStorage();
const uploader = multer({ storage, fileFilter: validateUpload });

cloudinary.config({ 
    cloud_name: process.env.CLD_INSTANCE, 
    api_key: process.env.CLD_KEY, 
    api_secret: process.env.CLD_SECRET
});

// memmoryStorage in multer loads the full image in memory(RAM) in binary form. Buffering means loading data into memory(RAM). to upload to a cloud storage we need to break the file into smaller chunks and transfer (pipe) them one by one from one place to another
// 1. create an async fn uploadStream with a file parameter
// 2. return a promise as cloudinary's upload_stream is promise based

const uploadToCloud = async (req) => {
    if(typeof req.file === 'undefined') {
        return {status: 500, msg: 'a featured image is required'};
    }

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            reject({ status: 500, message: 'something went wrong' });

          } else {
            resolve({ message: 'File uploaded successfully', secureUrl: result.secure_url });
          }
        }).end(req.file.buffer);
    });
}


export {uploader, uploadToCloud};