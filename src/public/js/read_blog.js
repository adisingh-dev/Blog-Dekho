const cancelbuttons = document.querySelectorAll('.errorpopupcancel');
cancelbuttons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.errorpopupcontainer').style.display = 'none';
        document.querySelector('.errorpopupoverlay').style.display = 'none';
    });
});


// toggle subscription
const subscribeBtn = document.querySelector('.subscription');
if(subscribeBtn) {
    subscribeBtn.addEventListener('click', async event => {
        try {
            const res = await axios.post('/toggle-subscription', { creatorId });
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
document.querySelector('.likesicon')
.addEventListener('click', async event => {
    try {
        const res = await axios.post('/toggle-likes', {
            creatorId: creatorId,
            blogId: blogId
        });
        document.querySelector('.likescount').textContent = res.data.likes;
        event.target.src = res.data.liked? "/assets/img/like-filled.svg": "/assets/img/like-outline.svg";
        
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

const managepost = document.querySelector('.manage-post');
if(managepost) {
    managepost.addEventListener('click', async event => {
        try {
            await axios.get(`/create_blog/${blogId}`);
            window.location.href = `/create_blog/${blogId}`;

        } catch (error) {
            document.querySelector('.errorpopuptext').textContent = 'Oops! Something went wrong. Could not redirect to post edit page';
            document.querySelector('.errorpopupoverlay').style.display = 'block';
            document.querySelector('.errorpopupcontainer').style.display = 'block';
        }
    });
}
