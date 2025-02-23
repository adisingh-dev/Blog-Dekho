document.addEventListener('DOMContentLoaded',()=>{
    let featuredImg = document.querySelector('#image-input');
    let previewImg = document.querySelector('#image-preview');
    // avoid preview img removal on pg reload
    if(featuredImg.files.length > 0 && !preview.src.includes('cloudinary')) {
        previewImg.src = localStorage.getItem('preview');
    }
});


// check if image correctly set on client
function validateImgSetting(eTarget) {
    return (eTarget.featured.files.length === 0 && eTarget.preview.src.length === 0)? false: true;
}


// client-side input validation
function validateInput(eTarget) {
    const body = tinymce.get("description").getContent();
    return (validateImgSetting(eTarget) === false|| eTarget.title.value === "" || eTarget.excerpt.value === "" ||  body === "")? false: true;
}


// reset img preview on form reset
document.getElementById('post-reset')
.addEventListener('click', e => {
    tinymce.get("description").setContent("");
    document.querySelector('#image-preview').src = "";
});


// handle file on change event and set localstorage item for preview img
document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem('preview', e.target.result);
            document.getElementById('image-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});


// handle form submit
const form = document.getElementById('create-blog');
form.addEventListener('submit', async e => {
    e.preventDefault();
    let inputFields = document.getElementsByClassName('input-field');

    const eTarget = e.target;
    try {
        document.getElementById('overlay').style.display = 'block';
        if(validateInput(eTarget) == false) {
            for(let field of inputFields) {
                if(field.value.length == 0) {
                    field.style.border = '2px solid red';
                }
            }
            if(validateImgSetting(eTarget) ==false) {
                let imgwrapper = document.querySelector('#image-preview');
                imgwrapper.style.border = '3px solid red';
            }
            document.getElementById('overlay').style.display = 'none';
            throw '*All fields are required. Pls enter valid input';

        }
        const formdata = new FormData();
        formdata.append('featured', (eTarget.featured.files.length > 0)? eTarget.featured.files[0]: eTarget.preview.src);
        formdata.append('title', eTarget.title.value);
        formdata.append('body', eTarget.description.value);
        formdata.append('excerpt', eTarget.excerpt.value);
        formdata.append('mode', 'manual');

        const res = await axios.post(e.target.action, formdata, {
            headers: "multipart/form-data"
        });
        console.log(res);
        
        let verdict = document.getElementById('verdict');
        verdict.textContent = res.data.message;
        verdict.style.color = '#43a535';

        for(let field of inputFields) {
            field.style.border = '2px solid #385480';
        }
        document.getElementById('overlay').style.display = 'none';

    } catch (error) {
        let verdict = document.getElementById('verdict');
        if(error.response) {
            verdict.textContent = error.response.data.message;

        } else if(error.request) {
            verdict.textContent = 'Oops! Something went wrong. Please try again later';

        } else if(typeof error == 'string') {
            verdict.textContent = error;
        }
        verdict.style.color = 'red';
    }
    
});