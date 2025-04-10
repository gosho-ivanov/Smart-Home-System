const API_BASE_URL = 'http://localhost:5000';

// Set the room name from URL parameter
function getRoomNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('roomName') || 'Room Control';
}

// Update the getRoomNameFromURL function
function getRoomIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('roomId');
}

// Update the room header
document.addEventListener('DOMContentLoaded', () => {
    // Set room name in header
    const roomName = getRoomNameFromURL();
    document.getElementById('room-header').textContent = roomName;

    // Back button functionality
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'mainPage.html';
    });

    // DOM elements
    const addLightsButton = document.getElementById('btn-add-light');
    const lightsContainer = document.getElementById('lights-buttons');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');
    const toggleLightBtn = document.getElementById('toggle-light');
    const deleteLightBtn = document.getElementById('delete-light');
    const dimmer = document.getElementById('dimmer');
    const dimmerValue = document.getElementById('dimmer-value');
    let currentLightButton = null;

    // Lights JSON list
    const lights = [];

    // Function to update the JSON display
    function updateJsonDisplay() {
        const lightsJsonContainer = document.getElementById('lights-json');
        if (lightsJsonContainer) {
            lightsJsonContainer.textContent = JSON.stringify(lights, null, 2);
        }
    }

    // Show the modal when a light button is clicked
    function showModal(lightButton) {
        currentLightButton = lightButton;
        modal.style.display = 'block';
        updateToggleButton();
        updateDimmer();
    }

    // Hide the modal when the close button is clicked
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Hide the modal when clicking outside of the modal content
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Add a new light button when the "Add lights +" button is clicked
    addLightsButton.addEventListener('click', async function () {
        const roomId = getRoomIdFromURL();
        const lightName = `Light ${lightsContainer.childElementCount + 1}`;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: lightName,
                    type: 'light',
                    status: 'off'
                })
            });

            if (!response.ok) throw new Error('Failed to add light');

            const newLight = await response.json();
            
            // Create the light button with the ID from the database
            const newLightButton = document.createElement('button');
            newLightButton.textContent = lightName;
            newLightButton.className = 'btn btn-secondary mt-2';
            newLightButton.dataset.id = newLight.device_id;
            newLightButton.dataset.state = 'off';
            newLightButton.dataset.dimmer = '100';

            newLightButton.addEventListener('click', function () {
                showModal(newLightButton);
            });

            lightsContainer.appendChild(newLightButton);
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding light');
        }
    });

    // Toggle the light state
    toggleLightBtn.addEventListener('click', async () => {
        if (currentLightButton) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/devices/${currentLightButton.dataset.id}/toggle`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to toggle light');

                const result = await response.json();
                currentLightButton.dataset.state = result.status;
                updateToggleButton();
                updateDimmer();
            } catch (error) {
                console.error('Error:', error);
            }
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

    // Function to add a socket
    addSocketBtn.addEventListener('click', async function () {
        const roomId = getRoomIdFromURL();
        const socketName = `Socket ${socketsContainer.childElementCount + 1}`;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: socketName,
                    type: 'socket',
                    status: 'off'
                })
            });

            if (!response.ok) throw new Error('Failed to add socket');

            const newSocket = await response.json();
            
            // Create the socket button with the ID from the database
            const newSocketButton = document.createElement('button');
            newSocketButton.textContent = socketName;
            newSocketButton.className = 'btn btn-secondary m-2 socket-btn';
            newSocketButton.dataset.id = newSocket.device_id;
            newSocketButton.dataset.state = 'off';

            newSocketButton.addEventListener('click', function () {
                currentSocket = sockets.find(s => s.id === parseInt(newSocketButton.dataset.id));
                if (currentSocket) {
                    socketControlTitle.textContent = currentSocket.name;
                    updateSocketControlButtons();
                    socketControlModal.style.display = 'block';
                }
            });

            socketsContainer.appendChild(newSocketButton);
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding socket');
        }
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

document.addEventListener("DOMContentLoaded", () => {
    const currentTempElement = document.getElementById("current-temperature");
    const targetedTempElement = document.getElementById("targeted-temperature");
    const tempUpButton = document.getElementById("btn-temp-up");
    const tempDownButton = document.getElementById("btn-temp-down");

    let currentTemperature = parseInt(currentTempElement.textContent);
    let targetedTemperature = parseInt(targetedTempElement.textContent);

    // Increase Targeted Temperature
    tempUpButton.addEventListener("click", () => {
        targetedTemperature++;
        targetedTempElement.textContent = targetedTemperature;
    });

    // Decrease Targeted Temperature
    tempDownButton.addEventListener("click", () => {
        if (targetedTemperature > currentTemperature) {
            targetedTemperature--;
            targetedTempElement.textContent = targetedTemperature;
        } else {
            alert("Targeted temperature cannot be lower than the current temperature.");
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Socket elements
    const addSocketBtn = document.getElementById('btn-add-socket');
    const socketsContainer = document.getElementById('sockets-buttons');
    const socketCreateModal = document.getElementById('socket-create-modal');
    const socketControlModal = document.getElementById('socket-control-modal');
    const socketNameInput = document.getElementById('socket-name-input');
    const saveSocketBtn = document.getElementById('save-socket-btn');
    const toggleSocketBtn = document.getElementById('toggle-socket-btn');
    const deleteSocketBtn = document.getElementById('delete-socket-btn');
    const socketControlTitle = document.getElementById('socket-control-title');
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close, .close-socket-control');
    
    // Track current socket being controlled
    let currentSocket = null;
    const sockets = [];

    // Open socket creation modal
    addSocketBtn.addEventListener('click', () => {
        socketNameInput.value = '';
        socketCreateModal.style.display = 'block';
    });

    // Save new socket
    saveSocketBtn.addEventListener('click', () => {
        const socketName = socketNameInput.value.trim();
        if (!socketName) {
            alert('Please enter a socket name');
            return;
        }

        const socket = {
            id: Date.now(),
            name: socketName,
            state: 'off'
        };
        
        sockets.push(socket);
        createSocketButton(socket);
        socketCreateModal.style.display = 'none';
    });

    // Create socket button in UI
    function createSocketButton(socket) {
        const socketBtn = document.createElement('button');
        socketBtn.className = 'btn btn-secondary m-2 socket-btn';
        socketBtn.textContent = socket.name;
        socketBtn.dataset.id = socket.id;
        socketBtn.dataset.state = socket.state;
        
        socketBtn.addEventListener('click', () => {
            currentSocket = sockets.find(s => s.id === parseInt(socketBtn.dataset.id));
            if (currentSocket) {
                socketControlTitle.textContent = currentSocket.name;
                updateSocketControlButtons();
                socketControlModal.style.display = 'block';
            }
        });
        
        socketsContainer.appendChild(socketBtn);
    }

    // Toggle socket state
    toggleSocketBtn.addEventListener('click', () => {
        if (currentSocket) {
            currentSocket.state = currentSocket.state === 'off' ? 'on' : 'off';
            updateSocketControlButtons();
            
            // Update the button in the UI
            const socketBtn = document.querySelector(`.socket-btn[data-id="${currentSocket.id}"]`);
            if (socketBtn) {
                socketBtn.dataset.state = currentSocket.state;
            }
        }
    });

    // Delete socket
    deleteSocketBtn.addEventListener('click', () => {
        if (currentSocket) {
            // Remove from array
            const index = sockets.findIndex(s => s.id === currentSocket.id);
            if (index !== -1) {
                sockets.splice(index, 1);
            }
            
            // Remove from UI
            const socketBtn = document.querySelector(`.socket-btn[data-id="${currentSocket.id}"]`);
            if (socketBtn) {
                socketBtn.remove();
            }
            
            socketControlModal.style.display = 'none';
        }
    });

    // Update control buttons based on socket state
    function updateSocketControlButtons() {
        if (currentSocket) {
            if (currentSocket.state === 'off') {
                toggleSocketBtn.textContent = 'Turn On';
                toggleSocketBtn.className = 'btn btn-success';
            } else {
                toggleSocketBtn.textContent = 'Turn Off';
                toggleSocketBtn.className = 'btn btn-danger';
            }
        }
    }

    // Close modals when clicking X
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            socketCreateModal.style.display = 'none';
            socketControlModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === socketCreateModal) {
            socketCreateModal.style.display = 'none';
        }
        if (e.target === socketControlModal) {
            socketControlModal.style.display = 'none';
        }
    });
});