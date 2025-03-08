const mountCancelButtons = () => {
    const cancelbuttons = document.querySelectorAll('.confirmcancel');
    const errorcancelbuttons = document.querySelectorAll('.errorpopupcancel');
    // cancel confirmation popup
    cancelbuttons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.confirmpopupoverlay').style.display = 'none';
            document.querySelector('.confirmpopupcontainer').style.display = 'none';
        });
    });
    // cancel error popup
    errorcancelbuttons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.errorpopupoverlay').style.display = 'none';
            document.querySelector('.errorpopupcontainer').style.display = 'none';
        });
    });
}


// reset event popup progress icons after blog creation
const resetProgressIcons = () => {
    const progressicons =  document.querySelectorAll('.event-progress');
    progressicons.forEach(nthprogressicon => {
        nthprogressicon.src = "/img/loader-xs.svg";
        nthprogressicon.style.width = 'auto';
        nthprogressicon.style.margin = '0';
    });
    document.querySelector('.popupoverlay').style.display = 'none';
    document.querySelector('.eventspopup').style.display = 'none';
};


document.addEventListener('DOMContentLoaded', () => {
    // set userprofile pic on navbar
    document.querySelector('.profilepic').src = profilepic;
    document.getElementById('welcome-username').textContent = username;
    
    // set popup cancel buttons
    mountCancelButtons();
    
    // reset progress icons on popup removal
    document.getElementById('canceleventpopup').addEventListener('click', resetProgressIcons);
    document.getElementById('errorpopupcancel-ok').addEventListener('click', resetProgressIcons);
});


function validateInput(inp, regex) {
    return regex.test(inp);
}


const mountEventSource = () => {
    window.addEventListener('beforeunload', () => {
        eventsource.close();
    });
    document.getElementById('canceleventpopup').disabled = true;
    document.getElementById('canceleventpopup').classList.remove('enablebtn');
    document.getElementById('canceleventpopup').classList.add('disablebtn');
    
    const eventsource = new EventSource(`/stream_blog_updates`);
    eventsource.addEventListener('close', () => {
        eventsource.close();
        const nthLi = document.querySelector(`#events li:nth-child(${++eventcounter})`);
        const nthImg = nthLi.querySelector(':nth-child(1)');
        nthImg.src = '/img/tick.svg';
        nthImg.style.width = '1.3rem';
        nthImg.style.height = '2.2rem';
        nthImg.style.margin = '0 1rem 0 .5rem';
        document.getElementById('canceleventpopup').disabled = false;
        document.getElementById('canceleventpopup').classList.remove('disablebtn');
        document.getElementById('canceleventpopup').classList.add('enablebtn');
    });

    eventsource.onerror = (err) => {
        eventsource.close();
        if (eventsource.readyState === EventSource.CLOSED) {
            // hide event display popup
            document.querySelector('.popupoverlay').style.display = 'none';
            document.querySelector('.eventspopup').style.display = 'none';
            // show generic error popup
            document.querySelector('.errorpopupoverlay').style.display = 'block';
            document.querySelector('.errorpopupcontainer').style.display = 'block';
        }
        document.querySelector('.errorpopuptext').textContent = err.data? err.data: 
        "Something went wrong while creating the blog. Please try again";;
    };

    let eventcounter = 0;
    eventsource.onmessage = (event) => {
        try {
            const nthLi = document.querySelector(`#events li:nth-child(${++eventcounter})`);
            const nthImg = nthLi.querySelector(':nth-child(1)');
            nthImg.src = '/img/tick.svg';
            nthImg.style.width = '1.3rem';
            nthImg.style.height = '2.2rem';
            nthImg.style.margin = '0 1rem 0 .5rem';

        } catch (error) {
            eventsource.close();
        }
    }
}


const triggerAutoBlog = () => {
    const keywords = document.getElementById('blog-relevant-keywords').value;
    const scheduledAt = document.getElementById('scheduled-at').value;
    const scheduledOn = document.getElementById('scheduled-on').value;
    document.querySelector('.confirmpopupcontainer').style.display = 'none';
    document.querySelector('.confirmpopupoverlay').style.display = 'none';
    automatePost(keywords, scheduledAt, scheduledOn);
}


document.getElementById('schedule')
.addEventListener('click', () => {
    const keywords = document.getElementById('blog-relevant-keywords').value;
    const scheduledAt = document.getElementById('scheduled-at').value;
    const scheduledOn = document.getElementById('scheduled-on').value;
    
    const scheduleatValid = validateInput(scheduledAt, /^^[0-9:]+$/);
    const scheduleonValid = validateInput(scheduledOn, /^^[0-9-]+$/);
    
    if(scheduleatValid && scheduleonValid) {
        document.querySelector('.confirmpopupcontainer').style.display = 'block';
        document.querySelector('.confirmpopupoverlay').style.display = 'block';
        document.querySelector('.confirmpopuptext').textContent = 
        `Are you sure you want to create the blog now and schedule it on ${scheduledOn} at ${scheduledAt}?`;
        
        document.getElementById('confirmok').removeEventListener('click', triggerAutoBlog)
        document.getElementById('confirmok').addEventListener('click', triggerAutoBlog);

    } else {
        document.getElementById('errormessage').textContent = 
        keywords.length == 0? "Prompt cannot be empty!":
        // !keywordsValid? "Keywords can only contain alphabets A-Z/a-z, ', \", !, comma and numbers 0-9":
        !scheduleatValid? "Schedule time can only contain numbers 0-9 and (:)":
        !scheduleonValid? "Schedule date can only contain numbers 0-9 and hyphen (-)": ""
    }
});


async function automatePost(keywords, scheduledAt, scheduledOn) {
    // initialize event update modal
    try {
        const res = await axios.post('/auto-blog', {
            keywords, scheduledAt, scheduledOn
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(res.data.inputCaptured) {
            document.querySelector('.popupoverlay').style.display = 'block';
            document.querySelector('.eventspopup').style.display = 'block';
            mountEventSource();
        }
            
    } catch (error) {
        if(error.response) {
            document.querySelector('.errorpopuptext').textContent = error.response.data.message;

        } else if(error.request) {
            document.querySelector('.errorpopuptext').textContent = 'Oops! Something went wrong. Please try again later';
        }
        // hide event display popup
        document.querySelector('.popupoverlay').style.display = 'none';
        document.querySelector('.eventspopup').style.display = 'none';

        // show generic error popup
        document.querySelector('.errorpopupoverlay').style.display = 'block';
        document.querySelector('.errorpopupcontainer').style.display = 'block';
    }
}


document.getElementById('reset')
.addEventListener('click', e => {
    document.getElementById('errormessage').textContent = "";
});