document.addEventListener('DOMContentLoaded', () => {
    const aboutSectionInput = document.querySelector('.about-sm');
    aboutSectionInput.disabled = true;
    aboutSectionInput.value = "";
});

document.getElementById('userprofilepic')
.addEventListener('change', event => {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.userprofilepic-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.querySelector('.userprofilepic-form')
.addEventListener('submit', async event => {
    event.preventDefault();
    const formdata = new FormData();
    formdata.append('userprofilepic', event.target.userprofilepic.files[0]);
    try {
        document.getElementById('overlay').style.display = 'block';
        const res = await axios.post('/api/v1/profile-image', formdata, {
            headers: 'multipart/form-data'
        });
        document.querySelector('.verdict').textContent = 
        'Congratulations! profile photo has been updated successfully';
        document.querySelector('.verdict').setAttribute('id', 'verdictgreen');
        document.querySelector('.profilepic').src = res.data.imgUrl;
        document.getElementById('overlay').style.display = 'none';
        
    } catch (error) {
        let verdict = document.querySelector('.verdict');
        if(error.response) {
            verdict.textContent = error.response.data.message;

        } else if(error.request) {
            verdict.textContent = 'Oops! Something went wrong. Please try again later';
        }
        verdict.setAttribute('id', 'verdictred');
        document.getElementById('overlay').style.display = 'none';
    }
});

document.querySelector('.about-edit')
.addEventListener('click', async () => {
    const aboutSectionInput = document.querySelector('.about-sm');
    const aboutSectionSave = document.querySelector('.about-save');
    const aboutSectionVerdict = document.querySelector('.about-verdict');
    const overlay = document.getElementById('overlay');

    aboutSectionInput.disabled = false;
    aboutSectionInput.style.borderBottom = '4px solid #414141';
    aboutSectionInput.value = aboutSectionInput.placeholder;
    aboutSectionSave.disabled = false;
    aboutSectionSave.style.display = 'block';

    aboutSectionSave.addEventListener('click', async () => {
        try {
            overlay.style.display = 'block';
            const res = await axios.post('/api/v1/about', {
                'content': aboutSectionInput.value
            }, {
                headers: {
                    "Content-Type": "application-json"
                }
            });
            overlay.style.display = 'none';
            aboutSectionVerdict.textContent = res.data.message;
            aboutSectionVerdict.style.color = '#00b73f';
            
        } catch(error) {
            if(error.response) {
                aboutSectionVerdict.textContent = error.response.data.message;

            } else if(error.request) {
                aboutSectionVerdict.textContent = 'Oops! Something went wrong. Please try again later';
            }
            aboutSectionVerdict.style.color = 'crimson';
            overlay.style.display = 'none';
        }
    });
});
