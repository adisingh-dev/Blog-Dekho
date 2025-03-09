document.addEventListener('DOMContentLoaded', async () => {
    // get subscribed channels data 
    const channels = await axios.get('/api/v1/subscriptions');
    document.querySelector('.profilepic').src = channels.data.userinfo.profilepic;
    document.getElementById('welcome-username').textContent = channels.data.userinfo.username;

    const subscriptionsWrapper = document.querySelector('.sub-wrapper');
    channels.data.data.forEach(channel => {
        subscriptionsWrapper.innerHTML += 
        `<div class="subscription-details">
            <div class="inner-icon">
                <img src=${channel.profilepic} class="preview">
            </div>
            <div class="channel-detail">
                <p class="channel-name">${channel.username}</p>
                <p class="subscriber-count">${channel.subscribers} Subscribers</p>
            </div>
        </div>`;
    });
});