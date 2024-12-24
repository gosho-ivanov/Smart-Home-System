// Function to get query parameter by name
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.querySelectorAll(".back-btn").forEach(button => {
    button.addEventListener('click', function() {
        window.location.href = 'mainPage.html';
    });
});

// Set the room name as the header
const roomName = getQueryParam('roomName');
document.getElementById('room-header').textContent = roomName ? roomName : 'Room';