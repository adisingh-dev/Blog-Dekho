// toggle subscription
const mountSubscribeButton = (creatorId) => {
    document.querySelector('.subscription')
    .addEventListener('click', async event => {
        try {
            const res = await axios.post('/api/v1/subscription', { creatorId },  {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            event.target.id = res.data.subscribed? 'following': 'follow';
            event.target.innerText = res.data.subscribed? 'Following': 'Follow';
            document.querySelector('.subscribercount').textContent = res.data.totalsubscribers + " Subscribers";
                
        } catch (error) {
            if(error.response) {
                document.querySelector('.errorpopuptext').textContent = error.response.data.message;

            } else if(error.request) {
                document.querySelector('.errorpopuptext').textContent = 'Oops! Something went wrong. Please try again later';
            }
            document.querySelector('.errorpopupoverlay').style.display = 'block';
            document.querySelector('.errorpopupcontainer').style.display = 'block';
        }
    });
}


// toggle likes
const mountLikesButton = (masterdata) => {
    const likesicon = document.querySelector('.likesicon');
    likesicon.addEventListener('click', async event => {
        try {
            const res = await axios.post('/api/v1/likes', {
                creatorId: masterdata.creatorinfo.id,
                blogId: masterdata.blog.id
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            document.querySelector('.likescount').textContent = res.data.likes;
            event.target.src = res.data.liked? "/assets/img/like-filled.svg": "/assets/img/like-outline.svg";
            
        } catch (error) {
            if(error.response) {
                document.querySelector('.errorpopuptext').textContent = error.response.data.message;
    
            } else if(error.request || error) {
                document.querySelector('.errorpopuptext').textContent = 'Oops! Something went wrong. Please try again later';
            }
            document.querySelector('.errorpopupoverlay').style.display = 'block';
            document.querySelector('.errorpopupcontainer').style.display = 'block';
        }
    });
}


// populate data in the read blog screen
const populateUi = (res) => {
    document.querySelector('.profilepic').src = res.userinfo.profilepic;
    document.getElementById('welcome-username').textContent = res.userinfo.username;
    document.querySelector('.pfp').src = res.creatorinfo.profilepic;
    document.querySelector('.subscribercount').textContent = `${res.creatorinfo.subscribers} Subscribers`;
    document.querySelector('.likescount').textContent = res.creatorinfo.likes;
    document.querySelector('.blog-graphic').src = res.blog.imgUrl;
    document.querySelector('.blog-title').textContent = res.blog.title;
    document.querySelector('.blog-body').textContent = res.blog.body;
    
    document.querySelector('.created-by').textContent = 
    `By ${res.creatorinfo.username} . ${res.creatorinfo.dateOfCreation}`;

    document.querySelector('.likesicon').src = 
    res.creatorinfo.liked? "/assets/img/like-filled.svg": "/assets/img/like-outline.svg";

    if(res.creatorinfo.id != res.userinfo.userid) {
        document.querySelector('.righttext').innerHTML +=
        `<span class="subscription" id=${res.creatorinfo.subscribed? 'following': 'follow'}>
            ${res.creatorinfo.subscribed? 'Following': 'Follow'}
        </span>`;
        mountSubscribeButton(res.creatorinfo.id);

    } else {
        document.querySelector('.righttext').innerHTML += 
        '<button class="manage-post">Manage</button>';
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // show loader
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    // get blogdata
    const res = await axios.get(`/api/v1/blogs/${blogId}`);

    // populate read blog screen with blogdata
    populateUi(res.data);
    mountLikesButton(res.data);
    let blogtitle = document.querySelector('.blog-title');
    let blogbody = document.querySelector('.blog-body');
    blogtitle.innerHTML = marked.parse(blogtitle.textContent);
    blogbody.innerHTML = marked.parse(blogbody.textContent);
    
    // hide loader
    overlay.style.display = 'none';

    // show option to edit blog if created by self
    const managepost = document.querySelector('.manage-post');
    if(managepost) {
        managepost.addEventListener('click', async event => {
            try {
                await axios.get(`/compose/${blogId}`);
                window.location.href = `/compose/${blogId}`;

            } catch (error) {
                document.querySelector('.errorpopuptext').textContent = 'Oops! Something went wrong. Could not redirect to post edit page';
                document.querySelector('.errorpopupoverlay').style.display = 'block';
                document.querySelector('.errorpopupcontainer').style.display = 'block';
            }
        });
    }

    const cancelbuttons = document.querySelectorAll('.errorpopupcancel');
    cancelbuttons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.errorpopupcontainer').style.display = 'none';
            document.querySelector('.errorpopupoverlay').style.display = 'none';
        });
    });
});
