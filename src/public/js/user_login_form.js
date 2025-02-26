window.onload = () => {
    document.getElementById('overlay').style.display = 'none';
};
document.getElementById('user-login-form')
.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const userLoginRes = await axios.post('/login', {
            username: event.target.username.value,
            password: event.target.password.value
        });
        if(userLoginRes.data.token) {
            window.location.href = '/blogs';
        }

    } catch (error) {
        if(error.response) {
            document.querySelector('.error-msg').textContent = error.response.data.message;

        } else if(error.request) {
            document.querySelector('.error-msg').textContent = 'Oops! Something went wrong. Please try again later';
        }
    }
});