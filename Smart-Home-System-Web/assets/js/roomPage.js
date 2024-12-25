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

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('myModal');
    const btnAddLight = document.getElementById('btn-add-light');
    const lightsContainer = document.getElementById('lights-container');
    const closeBtn = document.querySelector('.close');

    // Show the modal when a light button is clicked
    function showModal() {
        modal.style.display = 'block';
    }

    // Hide the modal when the close button is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Hide the modal when clicking outside of the modal content
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Add a new light button when the "Add lights +" button is clicked
    btnAddLight.addEventListener('click', function() {
        const lightButton = document.createElement('button');
        lightButton.className = 'btn btn-secondary mt-2';
        lightButton.textContent = 'Light ' + (lightsContainer.children.length + 1);
        lightButton.addEventListener('click', showModal);
        lightsContainer.appendChild(lightButton);
    });
});