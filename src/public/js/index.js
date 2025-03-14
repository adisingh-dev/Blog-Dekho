// parent container of a blog should hv same height as that of image
wrappers = document.querySelectorAll('.card-wrapper');    
wrappers.forEach(wrapper => {
    grf = wrapper.querySelector('img:nth-child(1)');
    wrapper.style.height = grf.clientHeight + 'px';
});

document.addEventListener('DOMContentLoaded', async () => {
    const res = await axios.get(`/api/v1/blogs`);

    document.querySelector('.profilepic').src = res.data.userinfo.profilepic;
    document.getElementById('welcome-username').textContent = res.data.userinfo.username;
    
    const grid = document.querySelector('.grid');
    grid.innerHTML = "";
    res.data.blogs.forEach(blog => {
        grid.innerHTML += 
        `<a class="card-wrapper-horizontal card-wrapper" href="/read-blog/${blog.id}">
            <img src="${blog.img_url}" alt="" class="blog-graphic"></img>
            <div class="blog-card-overlay"></div>
            <div class="blog-details-1">
                <p class="blog-title">${blog.title}</p>
            </div>
            <div class="blog-details-2">
                <p class="blog-excerpt">${blog.excerpt}</p>
                <div class="read-more">
                    <img class="read-more-img" src="/img/popout.svg" alt="">
                </div>
            </div>
        </a>`;
    });
});


document.getElementById('search-blog')
.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pattern = e.target.pattern.value;
    const res = await axios.get(`/api/v1/blogs?pattern=${pattern}`);

    const grid = document.querySelector('.grid');
    grid.innerHTML = "";

    res.data.blogs.forEach(blog => {
        grid.innerHTML += 
        `<a class="card-wrapper-horizontal card-wrapper" href="/read-blog/${blog.id}">
            <img src="${blog.img_url}" alt="" class="blog-graphic"></img>
            <div class="blog-card-overlay"></div>
            <div class="blog-details-1">
                <p class="blog-title">${blog.title}</p>
            </div>
            <div class="blog-details-2">
                <p class="blog-excerpt">${blog.excerpt}</p>
                <div class="read-more">
                    <img class="read-more-img" src="/img/popout.svg" alt="">
                </div>
            </div>
        </a>`;
    });        
});


// yet to integrate
const deleteBlog = document.getElementsByClassName('delete-blog');
for(let blog of deleteBlog)  {
    blog.addEventListener('click', async e => {
        e.preventDefault();
        const id = e.target.id;
        try {
            const res=  await axios.delete(`/api/v1/blogs/delete/${id}`);
            blog.parentElement.parentElement.remove();
            
        } catch (error) {
            document.querySelector('.errorpopupoverlay').style.display = 'block';
            document.querySelector('.errorpopupcontainer').style.display = 'block';
            document.querySelector('.errorpopuptext').textContent = "Something went wrong. Could not delete the blog. Please try again later";
        }
    });
};