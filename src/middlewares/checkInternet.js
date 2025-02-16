import axios from 'axios';

const checkInternet = async (req, res, next) => {
    try {
        const data = await axios.get('https://www.google.com');
        
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: '*No Internet Connection. Pls try again later'
        });
    }
    next();
}

export default checkInternet;