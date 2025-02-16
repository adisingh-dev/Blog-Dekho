window.onload = () => {
    document.getElementById('overlay').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    const power = document.querySelector('.power');
    power.addEventListener('click', () => {
        document.querySelector('.popupcontainer').style.display = 'block';
        document.querySelector('.popupoverlay').style.display = 'block';
    });

    const cancelbuttons = document.querySelectorAll('.popupcancel');
    cancelbuttons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.popupcontainer').style.display = 'none';
            document.querySelector('.popupoverlay').style.display = 'none';
        });
    });
});