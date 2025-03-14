// populate the UI with data whether blog is present or not
const populateUi = ({userinfo, blog}) => {
    document.querySelector('.profilepic').src = userinfo.profilepic;
    document.getElementById('welcome-username').textContent = userinfo.username
    if(blog?.id) {
        document.getElementById('create-blog').action = `/api/v1/blogs/${blog.id}`;
        document.querySelector("input[name='title']").value = blog.title;
        document.getElementById("excerpt").value = blog.excerpt;
        tinymce.get("description").setContent(marked.parse(blog.body));
        document.getElementById("image-preview").src = blog.imgUrl;

    } else {
        // document.getElementById("image-preview").src = localStorage.getItem('preview');
        document.getElementById('create-blog').action = `/api/v1/blogs`;
    }
}


// undo error borders
const undoBorders = () => {
    let inputFields = document.getElementsByClassName('input-field');
    for(let field of inputFields) {
        field.style.border = '3px solid #414141';
    }
    document.querySelector('#image-preview').style.border = '3px solid #414141';
}


window.onload = async () => {
    const blogdetails = await axios.get(`/api/v1/blogs/${blogId}`);
    populateUi(blogdetails.data);
    document.getElementById('overlay').style.display = 'none';
}


// check if image correctly set on client
function validateImgSetting(eTarget) {
    return (eTarget.featured.files.length > 0 && eTarget.preview.src.length > 0)? true: false;
}


// client-side input validation
function validateInput(eTarget) {
    return (validateImgSetting(eTarget) === false || 
        eTarget.title.value === "" || 
        eTarget.excerpt.value === "" ||  
        eTarget.body.value === ""

    )? false: true;
}


// reset img preview on form reset
document.getElementById('post-reset')
.addEventListener('click', () => {
    tinymce.get("description").startContent = "";
    document.getElementById('header').setAttribute('value', "");
    document.getElementById('excerpt').setAttribute('value', "");
    document.getElementById('excerpt').textContent = "";
});


// handle file on change event
document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
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
    eTarget.body.value = tinymce.get("description").getContent();
    try {
        document.getElementById('overlay').style.display = 'block';
        if(validateInput(eTarget) == false) {
            for(let field of inputFields) {
                field.style.border = field.value.length == 0?
                '2px solid red':
                '3px solid #414141';
            }
            let imgwrapper = document.querySelector('#image-preview');
            console.log(validateImgSetting(eTarget))
            imgwrapper.style.border = validateImgSetting(eTarget) == false?
            '3px solid red':
            '3px solid #414141';

            // remove the loader
            document.getElementById('overlay').style.display = 'none';

            // throw error all fields mandatory
            throw '*All fields are required. Pls enter valid input';
        }
        const formdata = new FormData();
        formdata.append('featured', (
            eTarget.featured.files.length > 0)?
            eTarget.featured.files[0]: 
            eTarget.preview.src
        );
        formdata.append('title', eTarget.title.value);
        formdata.append('body', eTarget.body.value);
        formdata.append('excerpt', eTarget.excerpt.value);
        formdata.append('mode', 'manual');

        const res = await axios.post(e.target.action, formdata, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        let verdict = document.getElementById('verdict');
        verdict.textContent = res.data.message;
        verdict.style.color = '#43a535';

        // undo error borders
        undoBorders();

        // remove the loader
        document.getElementById('overlay').style.display = 'none';

    } catch (error) {
        // remove the loader
        document.getElementById('overlay').style.display = 'none';
        
        let verdict = document.getElementById('verdict');
        if(error.response) {
            verdict.textContent = error.response.data.message;
            // undo error borders
            undoBorders();

        } else if(error.request) {
            verdict.textContent = 'Oops! Something went wrong. Please try again later';

        } else if(typeof error == 'string') {
            verdict.textContent = error;
        }
        verdict.style.color = 'red';
    }
    
});