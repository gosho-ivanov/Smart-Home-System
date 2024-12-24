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

// Add lights functionality
document.addEventListener('DOMContentLoaded', (event) => {
    const addLightsButton = document.getElementById('btn-lights');
    const roomSection = document.querySelector('.room-section');

    addLightsButton.addEventListener('click', () => {
        const newLight = document.createElement('div');
        newLight.className = 'light';
        newLight.innerHTML = `
            <p>Light ${document.querySelectorAll('.light').length + 1}</p>
            <button class="toggle-light">Toggle</button>
            <button class="delete-light">Delete</button>
        `;
        roomSection.appendChild(newLight);

        const toggleButton = newLight.querySelector('.toggle-light');
        toggleButton.addEventListener('click', () => {
            newLight.classList.toggle('on');
        });

        const deleteButton = newLight.querySelector('.delete-light');
        deleteButton.addEventListener('click', () => {
            roomSection.removeChild(newLight);
        });
    });
});