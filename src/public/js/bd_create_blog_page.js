function validateInput(inp, regex) {
    return regex.test(inp);
}


const mountEventSource = () => {
    window.addEventListener('beforeunload', () => {
        eventsource.close();
    });
    document.getElementById('canceleventpopup').disabled = true;
    document.getElementById('canceleventpopup').classList.add('disablebtn');
    
    const eventsource = new EventSource(`/stream_blog_updates`);
    eventsource.addEventListener('close', () => {
        eventsource.close();
        const nthLi = document.querySelector(`#events li:nth-child(${++eventcounter})`);
        const nthImg = nthLi.querySelector(':nth-child(1)');
        nthImg.src = '/assets/img/tick.svg';
        nthImg.classList.add('event-completed');

        document.getElementById('canceleventpopup').disabled = false;
        document.getElementById('canceleventpopup')
        .addEventListener('click', () => {
            document.querySelector('.popupoverlay').style.display = 'none';
            document.querySelector('.eventspopup').style.display = 'none';
        });

        document.getElementById('canceleventpopup').classList.remove('disablebtn');
        document.getElementById('canceleventpopup').classList.add('enablebtn');
    });

    eventsource.onerror = (err) => {
        eventsource.close();
        if (eventsource.readyState === EventSource.CLOSED) {
            console.log('Reconnecting...');
        }
    };

    const ul = document.getElementById('events');
    let eventcounter = 0;
    eventsource.onmessage = (event) => {
        const nthLi = document.querySelector(`#events li:nth-child(${++eventcounter})`);
        const nthImg = nthLi.querySelector(':nth-child(1)');
        nthImg.src = '/assets/img/tick.svg';
        nthImg.classList.add('event-completed');
        console.log(event.data);
    }
}


document.getElementById('auto-form-create')
.addEventListener('submit', async e => {
    e.preventDefault();

    const usernameValid = validateInput(e.target.keywords.value, /^[A-Za-z0-9 ]{1,500}$/);
    const scheduleatValid = validateInput(e.target.scheduledAt.value, /^^[0-9:]+$/);
    const scheduleonValid = validateInput(e.target.scheduledOn.value, /^^[0-9-]+$/);
    
    if(usernameValid && scheduleatValid && scheduleonValid) {
        // initialize popup
        document.querySelector('.popupoverlay').style.display = 'block';
        document.querySelector('.eventspopup').style.display = 'block';

        try {
            const res = await axios.post('/auto_blog_data', e.target, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(res.data.inputCaptured) {
                mountEventSource();

            } else {
                console.log('auto blog data capture failed');
                document.getElementById('errormessage').textContent = "Something went wrong. Please try again later";
            }
                
        } catch (error) {
            document.getElementById('overlay').style.display = 'none';
            document.querySelector('#errormessage').textContent = 'Something went wrong. Please try again later';
        }
          
    } else {
        document.getElementById('errormessage').textContent = 
        !usernameValid? "Username can only contain alphabets A-Z/a-z and numbers 0-9":
        !scheduleatValid? "Schedule at field can only contain numbers 0-9 and (:)":
        !scheduleonValid? "Schedule on field can only contain numbers 0-9 and hyphen (-)": ""
    }

});

document.getElementById('reset')
.addEventListener('click', e => {
    document.getElementById('error-message').textContent = "";
});