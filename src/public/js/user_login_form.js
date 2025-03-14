window.onload = () => {
    document.getElementById('overlay').style.display = 'none';
};
document.getElementById('user-login-form')
.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const userLoginRes = await axios.post('/api/v1/login', {
            username: event.target.username.value,
            password: event.target.password.value
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        if(userLoginRes.data.token) {
            window.location.href = '/home';
        }

    } catch (error) {
        if(error.response) {
            document.querySelector('.error-msg').textContent = error.response.data.message;

        } else if(error.request) {
            document.querySelector('.error-msg').textContent = 'Oops! Something went wrong. Please try again later';
        }
    }
});