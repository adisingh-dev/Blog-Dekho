const sanitizeInputs = (req, res) => {
    const inputs = [];
    for(let input of req.body) {
        inputs.push(input);
    };
    return sanitizeInputsUtil(inputs);
}

export default sanitizeInputs;