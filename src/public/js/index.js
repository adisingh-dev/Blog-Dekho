// parent container of a blog should hv same height as that of image
wrappers = document.querySelectorAll('.card-wrapper');    
wrappers.forEach(wrapper => {
    grf = wrapper.querySelector('img:nth-child(1)');
    wrapper.style.height = grf.clientHeight + 'px';
});

// yet to integrate
const deleteBlog = document.getElementsByClassName('delete-blog');
for(let blog of deleteBlog)  {
    blog.addEventListener('click', async e => {
        e.preventDefault();
        const id = e.target.id;
        try {
            const res=  await axios.delete(`/blogs/delete/${id}`);
            blog.parentElement.parentElement.remove();
            
        } catch (error) {
            document.querySelector('.errorpopupoverlay').style.display = 'block';
            document.querySelector('.errorpopupcontainer').style.display = 'block';
            document.querySelector('.errorpopuptext').textContent = "Something went wrong. Could not delete the blog. Please try again later";
        }
    });
};