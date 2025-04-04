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
    const addLightsButton = document.getElementById('btn-add-light');
    const lightsContainer = document.getElementById('lights-buttons');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');
    const toggleLightBtn = document.getElementById('toggle-light');
    const deleteLightBtn = document.getElementById('delete-light');
    const dimmer = document.getElementById('dimmer');
    const dimmerValue = document.getElementById('dimmer-value');
    let currentLightButton = null;

    // Show the modal when a light button is clicked
    function showModal(lightButton) {
        currentLightButton = lightButton;
        modal.style.display = 'block';
        updateToggleButton();
        updateDimmer();
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
    addLightsButton.addEventListener('click', function () {
        const newLightButton = document.createElement('button');
        newLightButton.textContent = 'Light ' + (lightsContainer.childElementCount + 1);
        newLightButton.className = 'btn btn-secondary mt-2';
        newLightButton.dataset.state = 'off';
        newLightButton.dataset.dimmer = '100'; // Default dimmer value
        newLightButton.addEventListener('click', function() {
            showModal(newLightButton);
        });
        lightsContainer.appendChild(newLightButton);
    });

    // Add a new socket button when the "Add sockets +" button is clicked
    document.getElementById('btn-add-socket').addEventListener('click', function () {
        const socketButtonsContainer = document.querySelector('#sockets-container #sockets-buttons');
        const newSocketButton = document.createElement('button');
        newSocketButton.textContent = 'Socket ' + (socketButtonsContainer.childElementCount + 1);
        newSocketButton.className = 'btn btn-secondary mt-2';
        socketButtonsContainer.appendChild(newSocketButton);
    });

    // Toggle the light state
    toggleLightBtn.addEventListener('click', () => {
        if (currentLightButton) {
            const currentState = currentLightButton.dataset.state;
            const newState = currentState === 'off' ? 'on' : 'off';
            currentLightButton.dataset.state = newState;
            updateToggleButton();
            updateDimmer();
        }
    });

    // Update the toggle button text and color
    function updateToggleButton() {
        if (currentLightButton) {
            const currentState = currentLightButton.dataset.state;
            toggleLightBtn.textContent = currentState === 'off' ? 'Turn On' : 'Turn Off';
            toggleLightBtn.className = currentState === 'off' ? 'btn btn-success mt-2' : 'btn btn-danger mt-2';
        }
    }

    // Update the dimmer slider state
    function updateDimmer() {
        if (currentLightButton) {
            const currentState = currentLightButton.dataset.state;
            dimmer.disabled = currentState === 'off';
            dimmer.value = currentLightButton.dataset.dimmer;
            dimmerValue.textContent = `${dimmer.value}%`;
        }
    }

    // Update the dimmer value when the slider is changed
    dimmer.addEventListener('input', () => {
        if (currentLightButton) {
            currentLightButton.dataset.dimmer = dimmer.value;
            dimmerValue.textContent = `${dimmer.value}%`;
        }
    });

    // Delete the current light
    deleteLightBtn.addEventListener('click', () => {
        if (currentLightButton) {
            lightsContainer.removeChild(currentLightButton);
            modal.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Lights and Sockets JSON lists
    const lights = [];
    const sockets = [];

    // DOM elements
    const lightsButtonsContainer = document.getElementById('lights-buttons');
    const socketsButtonsContainer = document.getElementById('sockets-buttons');
    const lightsJsonContainer = document.getElementById('lights-json');
    const socketsJsonContainer = document.getElementById('sockets-json');
    const addLightBtn = document.getElementById('btn-add-light');
    const addSocketBtn = document.getElementById('btn-add-socket');

    // Function to update the JSON display
    function updateJsonDisplay() {
        lightsJsonContainer.textContent = JSON.stringify(lights, null, 2);
        socketsJsonContainer.textContent = JSON.stringify(sockets, null, 2);
    }

    // Function to add a light
    addLightBtn.addEventListener('click', function () {
        const lightId = lights.length + 1;
        const light = { id: lightId, name: `Light ${lightId}` };
        lights.push(light);

        // Create a button for the light
        const lightButton = document.createElement('button');
        lightButton.textContent = light.name;
        lightButton.className = 'btn btn-secondary btn-sm';
        lightButton.style.marginRight = '5px';

        // Add functionality to the light button
        lightButton.addEventListener('click', function () {
            alert(`You clicked ${light.name}`);
        });

        lightsButtonsContainer.appendChild(lightButton);
        updateJsonDisplay(); // Update the JSON display
    });

    // Function to add a socket
    addSocketBtn.addEventListener('click', function () {
        const socketId = sockets.length + 1;
        const socket = { id: socketId, name: `Socket ${socketId}` };
        sockets.push(socket);

        // Create a button for the socket
        const socketButton = document.createElement('button');
        socketButton.textContent = socket.name;
        socketButton.className = 'btn btn-secondary btn-sm';
        socketButton.style.marginRight = '5px';

        // Add functionality to the socket button
        socketButton.addEventListener('click', function () {
            alert(`You clicked ${socket.name}`);
        });

        socketsButtonsContainer.appendChild(socketButton);
        updateJsonDisplay(); // Update the JSON display
    });

    // Initialize JSON display
    updateJsonDisplay();
});

document.addEventListener('DOMContentLoaded', function () {
    // Temperature controls
    const temperatureValue = document.getElementById('temperature-value');
    const tempUpBtn = document.getElementById('btn-temp-up');
    const tempDownBtn = document.getElementById('btn-temp-down');

    let currentTemperature = 22; // Default temperature

    // Increase temperature
    tempUpBtn.addEventListener('click', function () {
        currentTemperature++;
        temperatureValue.textContent = currentTemperature;
    });

    // Decrease temperature
    tempDownBtn.addEventListener('click', function () {
        currentTemperature--;
        temperatureValue.textContent = currentTemperature;
    });
});