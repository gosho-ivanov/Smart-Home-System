// Set the room name and ID from URL parameters
function getRoomParamsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: params.get('roomName') || 'Room Control',
        id: parseInt(params.get('roomId')) || 0
    };
}

// Global variables
let currentRoom = {};
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
        const response = await fetch(url, options);
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
        const devices = await makeApiCall(`/api/rooms/${currentRoom.id}/devices`);
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
        document.getElementById('current-temperature').textContent = thermostat.current_temperature;
        document.getElementById('targeted-temperature').textContent = thermostat.target_temperature;
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

// Add a new device
async function addDevice(roomId, name, type) {
    try {
        const result = await makeApiCall(
            `/api/rooms/${roomId}/devices`,
            'POST',
            { name, type, status: 'off' }
        );
        return result.device_id;
    } catch (error) {
        console.error('Failed to add device:', error);
        throw error;
    }
}

// Delete a device
async function deleteDevice(deviceId) {
    // Note: You'll need to implement a DELETE endpoint in your backend
    try {
        await makeApiCall(
            `/api/devices/${deviceId}`,
            'DELETE'
        );
        return true;
    } catch (error) {
        console.error('Failed to delete device:', error);
        throw error;
    }
}

// Update thermostat temperature
async function updateThermostat(deviceId, currentTemp, targetTemp) {
    // Note: You'll need to implement this endpoint in your backend
    try {
        await makeApiCall(
            `/api/devices/${deviceId}/thermostat`,
            'PUT',
            { current_temperature: currentTemp, target_temperature: targetTemp }
        );
        return true;
    } catch (error) {
        console.error('Failed to update thermostat:', error);
        throw error;
    }
}

// Light Control Modal Functions
function showLightControlModal(light) {
    const modal = document.getElementById('myModal');
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
                await deleteDevice(light.device_id);
                const lightBtn = document.querySelector(`.light-btn[data-id="${light.device_id}"]`);
                if (lightBtn) {
                    lightBtn.remove();
                }
                modal.style.display = 'none';
            } catch (error) {
                alert('Failed to delete light. Please try again.');
            }
        }
    };

    dimmer.oninput = async () => {
        dimmerValue.textContent = `${dimmer.value}%`;
        // Note: You'll need to implement brightness update in your backend
        // await updateLightBrightness(light.device_id, dimmer.value);
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
                await deleteDevice(socket.device_id);
                const socketBtn = document.querySelector(`.socket-btn[data-id="${socket.device_id}"]`);
                if (socketBtn) {
                    socketBtn.remove();
                }
                modal.style.display = 'none';
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

    // Get room info from URL
    currentRoom = getRoomParamsFromURL();
    document.getElementById('room-header').textContent = currentRoom.name;

    // Back button functionality
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'mainPage.html';
    });

    // Load devices for the room
    await loadDevices();

    // Add Light button
    document.getElementById('btn-add-light').addEventListener('click', async () => {
        const lightName = prompt('Enter light name:');
        if (lightName) {
            try {
                await addDevice(currentRoom.id, lightName, 'light');
                await loadDevices(); // Refresh the device list
            } catch (error) {
                alert('Failed to add light. Please try again.');
            }
        }
    });

    // Add Socket button
    document.getElementById('btn-add-socket').addEventListener('click', async () => {
        const socketName = prompt('Enter socket name:');
        if (socketName) {
            try {
                await addDevice(currentRoom.id, socketName, 'socket');
                await loadDevices(); // Refresh the device list
            } catch (error) {
                alert('Failed to add socket. Please try again.');
            }
        }
    });

    // Temperature controls
    const tempUpBtn = document.getElementById('btn-temp-up');
    const tempDownBtn = document.getElementById('btn-temp-down');
    const targetedTempElement = document.getElementById('targeted-temperature');

    tempUpBtn.addEventListener('click', () => {
        const currentTemp = parseInt(targetedTempElement.textContent);
        targetedTempElement.textContent = currentTemp + 1;
        // Note: You'll need to implement thermostat update in your backend
        // updateThermostat(thermostatDeviceId, null, currentTemp + 1);
    });

    tempDownBtn.addEventListener('click', () => {
        const currentTemp = parseInt(targetedTempElement.textContent);
        if (currentTemp > 10) { // Minimum temperature check
            targetedTempElement.textContent = currentTemp - 1;
            // Note: You'll need to implement thermostat update in your backend
            // updateThermostat(thermostatDeviceId, null, currentTemp - 1);
        }
    });

    // Modal close buttons
    document.querySelectorAll('.close, .close-socket-control').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('myModal').style.display = 'none';
            document.getElementById('socket-control-modal').style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('myModal')) {
            document.getElementById('myModal').style.display = 'none';
        }
        if (e.target === document.getElementById('socket-control-modal')) {
            document.getElementById('socket-control-modal').style.display = 'none';
        }
    });
});