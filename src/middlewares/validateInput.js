const validateInput = (req, res, next) => {
    let params = req.body;
    for(let param of Object.values(params)) {
        param = (param)? param.trim(): param;
        if(param.length === 0
        || param === undefined
        || param.includes('<script>')
        || param.includes('</script>')) {
            return res.status(201).json({
                code: 201,
                message: 'Please enter valid inputs!'
            });
        }
    }
    next();
};

export default validateInput;