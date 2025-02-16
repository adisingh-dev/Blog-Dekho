window.onload = () => {
    document.getElementById('overlay').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('verdict').textContent = "";
});

const setVerdict = (response) => {
    let verdict = document.getElementById('verdict');
    verdict.textContent = response.message;
    verdict.style.color = (response.statusCode >= 200 && response.statusCode <= 299)? 'green': 'red'; 
}

document.getElementById('user-registeration-form')
.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const userRegisterationRes = await axios.post('/register', {
            username: event.target.username.value,
            email: event.target.email.value,
            password: event.target.password.value,
            confirmPassword: event.target.confirmpassword.value
        });
        setVerdict(userRegisterationRes.data);

    } catch (error) {
        setVerdict(error.response.data);
    }
});