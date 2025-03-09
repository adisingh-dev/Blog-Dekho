document.addEventListener('DOMContentLoaded', async () => {
    // get subscribed channels data 
    const blogs = await axios.get('/api/v1/likes');
    document.querySelector('.profilepic').src = blogs.data.userinfo.profilepic;
    document.getElementById('welcome-username').textContent = blogs.data.userinfo.username;
    const grid = document.querySelector('.grid');
    blogs.data.blogs.forEach(blog => {
        grid.innerHTML += 
        `<div class="liked-blogs">
            <a class="card-wrapper-horizontal card-wrapper" href="/blogs/${blog.id}">
                <img src="${blog.img_url}" alt="" class="blog-graphic"></img>
                <div class="blog-card-overlay"></div>
                <div class="blog-details-1">
                    <p class="blog-title">${blog.title}</p>
                </div>
                <div class="blog-details-2">
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <div class="read-more">
                        <img class="read-more-img" src="/img/popout.svg">
                    </div>
                </div>
            </a>
        </div>`;
    });
});