const BACKEND_BASE_URL = 'http://127.0.0.1:5000';

// Global variables
let currentRoom = {};
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('user_id'));
const params = new URLSearchParams(window.location.search);
const roomId = parseInt(params.get('roomId'), 10);

// Helper function for API calls
async function makeApiCall(url, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}${url}`, options);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Load devices for the current room
async function loadDevices() {
    try {
        const devices = await makeApiCall(`/api/rooms/${roomId}/devices`);
        renderDevices(devices);
    } catch (error) {
        alert('Failed to load devices. Please try again.');
    }
}

// Render devices in the UI
function renderDevices(devices) {
    const lightsContainer = document.getElementById('lights-buttons');
    const socketsContainer = document.getElementById('sockets-buttons');
    
    // Clear existing devices
    lightsContainer.innerHTML = '';
    socketsContainer.innerHTML = '';

    // Separate devices by type
    const lights = devices.filter(d => d.type === 'light');
    const sockets = devices.filter(d => d.type === 'socket');
    const thermostats = devices.filter(d => d.type === 'thermostat');

    // Render lights
    lights.forEach(light => {
        const lightBtn = createDeviceButton(light, 'light');
        lightsContainer.appendChild(lightBtn);
    });

    // Render sockets
    sockets.forEach(socket => {
        const socketBtn = createDeviceButton(socket, 'socket');
        socketsContainer.appendChild(socketBtn);
    });

    // Update thermostat display if exists
    if (thermostats.length > 0) {
        const thermostat = thermostats[0];
        document.getElementById('current-temperature').textContent = thermostat.current_temperature || '20';
        document.getElementById('targeted-temperature').textContent = thermostat.target_temperature || '20';
    }
}

// Create a device button
function createDeviceButton(device, type) {
    const button = document.createElement('button');
    button.className = `btn btn-secondary m-2 device-btn ${type}-btn`;
    button.textContent = device.name;
    button.dataset.id = device.device_id;
    button.dataset.type = type;
    button.dataset.status = device.status;

    // Update button appearance based on status
    updateDeviceButtonAppearance(button);

    // Add click handler
    button.addEventListener('click', () => {
        if (type === 'light') {
            showLightControlModal(device);
        } else if (type === 'socket') {
            showSocketControlModal(device);
        }
    });

    return button;
}

// Update device button appearance based on status
function updateDeviceButtonAppearance(button) {
    const isOn = button.dataset.status === 'on';
    if (button.dataset.type === 'light') {
        button.className = isOn ? 
            'btn btn-warning m-2 device-btn light-btn' : 
            'btn btn-secondary m-2 device-btn light-btn';
    } else if (button.dataset.type === 'socket') {
        button.className = isOn ? 
            'btn btn-success m-2 device-btn socket-btn' : 
            'btn btn-secondary m-2 device-btn socket-btn';
    }
}

// Toggle device status
async function toggleDevice(deviceId) {
    try {
        const result = await makeApiCall(
            `/api/devices/${deviceId}/toggle`, 
            'POST'
        );
        return result.status;
    } catch (error) {
        console.error('Failed to toggle device:', error);
        throw error;
    }
}

// Light Control Modal Functions
function showLightControlModal(light) {
    const modal = document.getElementById('light-control-modal');
    const toggleBtn = document.getElementById('toggle-light');
    const deleteBtn = document.getElementById('delete-light');
    const dimmer = document.getElementById('dimmer');
    const dimmerValue = document.getElementById('dimmer-value');

    // Set initial values
    toggleBtn.textContent = light.status === 'off' ? 'Turn On' : 'Turn Off';
    toggleBtn.className = light.status === 'off' ? 'btn btn-success' : 'btn btn-danger';
    dimmer.disabled = light.status === 'off';
    dimmer.value = light.brightness || 100;
    dimmerValue.textContent = `${dimmer.value}%`;

    // Set event handlers
    toggleBtn.onclick = async () => {
        try {
            const newStatus = await toggleDevice(light.device_id);
            const lightBtn = document.querySelector(`.light-btn[data-id="${light.device_id}"]`);
            if (lightBtn) {
                lightBtn.dataset.status = newStatus;
                updateDeviceButtonAppearance(lightBtn);
                toggleBtn.textContent = newStatus === 'off' ? 'Turn On' : 'Turn Off';
                toggleBtn.className = newStatus === 'off' ? 'btn btn-success' : 'btn btn-danger';
                dimmer.disabled = newStatus === 'off';
            }
        } catch (error) {
            alert('Failed to toggle light. Please try again.');
        }
    };

    deleteBtn.onclick = async () => {
        if (confirm('Are you sure you want to delete this light?')) {
            try {
                await makeApiCall(
                    `/api/devices/${light.device_id}`,
                    'DELETE'
                );
                const lightBtn = document.querySelector(`.light-btn[data-id="${light.device_id}"]`);
                if (lightBtn) lightBtn.remove();
                modal.style.display = 'none';
                await loadDevices();
            } catch (error) {
                alert('Failed to delete light. Please try again.');
            }
        }
    };

    dimmer.oninput = () => {
        dimmerValue.textContent = `${dimmer.value}%`;
        // Implement brightness update when backend is ready
        // updateLightBrightness(light.device_id, dimmer.value);
    };

    modal.style.display = 'block';
}

// Socket Control Modal Functions
function showSocketControlModal(socket) {
    const modal = document.getElementById('socket-control-modal');
    const title = document.getElementById('socket-control-title');
    const toggleBtn = document.getElementById('toggle-socket-btn');
    const deleteBtn = document.getElementById('delete-socket-btn');

    // Set initial values
    title.textContent = socket.name;
    toggleBtn.textContent = socket.status === 'off' ? 'Turn On' : 'Turn Off';
    toggleBtn.className = socket.status === 'off' ? 'btn btn-success' : 'btn btn-danger';

    // Set event handlers
    toggleBtn.onclick = async () => {
        try {
            const newStatus = await toggleDevice(socket.device_id);
            const socketBtn = document.querySelector(`.socket-btn[data-id="${socket.device_id}"]`);
            if (socketBtn) {
                socketBtn.dataset.status = newStatus;
                updateDeviceButtonAppearance(socketBtn);
                toggleBtn.textContent = newStatus === 'off' ? 'Turn On' : 'Turn Off';
                toggleBtn.className = newStatus === 'off' ? 'btn btn-success' : 'btn btn-danger';
            }
        } catch (error) {
            alert('Failed to toggle socket. Please try again.');
        }
    };

    deleteBtn.onclick = async () => {
        if (confirm('Are you sure you want to delete this socket?')) {
            try {
                await makeApiCall(
                    `/api/devices/${socket.device_id}`,
                    'DELETE'
                );
                const socketBtn = document.querySelector(`.socket-btn[data-id="${socket.device_id}"]`);
                if (socketBtn) socketBtn.remove();
                modal.style.display = 'none';
                await loadDevices();
            } catch (error) {
                alert('Failed to delete socket. Please try again.');
            }
        }
    };

    modal.style.display = 'block';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!authToken || !currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Set room header
    document.getElementById('room-header').textContent = 
        localStorage.getItem('selectedRoom') || 'Room Control';

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        localStorage.removeItem('selectedRoom');
        window.location.href = 'mainPage.html';
    });

    // Load devices if valid room
    if (roomId) {
        await loadDevices();
    } else {
        alert('No room selected. Redirecting...');
        window.location.href = 'mainPage.html';
        return;
    }

    // Add device buttons
    document.getElementById('btn-add-light').addEventListener('click', async () => {
        const name = prompt('Enter light name:');
        if (name) {
            try {
                await makeApiCall(
                    `/api/rooms/${roomId}/devices`,
                    'POST',
                    { name, type: 'light', status: 'off' }
                );
                await loadDevices();
            } catch (error) {
                alert('Failed to add light: ' + error.message);
            }
        }
    });

    document.getElementById('btn-add-socket').addEventListener('click', async () => {
        const name = prompt('Enter socket name:');
        if (name) {
            try {
                await makeApiCall(
                    `/api/rooms/${roomId}/devices`,
                    'POST',
                    { name, type: 'socket', status: 'off' }
                );
                await loadDevices();
            } catch (error) {
                alert('Failed to add socket: ' + error.message);
            }
        }
    });

    // Temperature controls
    const tempUp = document.getElementById('btn-temp-up');
    const tempDown = document.getElementById('btn-temp-down');
    const tempDisplay = document.getElementById('targeted-temperature');

    if (tempUp && tempDown && tempDisplay) {
        tempUp.addEventListener('click', () => {
            tempDisplay.textContent = parseInt(tempDisplay.textContent) + 1;
        });

        tempDown.addEventListener('click', () => {
            const currentTemp = parseInt(tempDisplay.textContent);
            if (currentTemp > 10) {
                tempDisplay.textContent = currentTemp - 1;
            }
        });
    }

    // Modal close handlers
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('light-control-modal').style.display = 'none';
            document.getElementById('socket-control-modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('light-control-modal')) {
            document.getElementById('light-control-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('socket-control-modal')) {
            document.getElementById('socket-control-modal').style.display = 'none';
        }
    });
});