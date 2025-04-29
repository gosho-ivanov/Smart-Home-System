const BACKEND_BASE_URL = 'http://127.0.0.1:5000';

// Global variables
let currentRoom = {};
let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user_id'));
const params = new URLSearchParams(window.location.search);
const roomId = parseInt(params.get('roomId'), 10);

// Helper for API calls
async function makeApiCall(url, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${BACKEND_BASE_URL}${url}`, options);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Load devices from DB
async function loadDevices() {
    try {
        const devices = await makeApiCall(`/api/rooms/${roomId}/devices`);
        renderDevices(devices);
    } catch (error) {
        alert('Failed to load devices.');
    }
}

// Render device buttons
function renderDevices(devices) {
    const lightsContainer = document.getElementById('lights-buttons');
    lightsContainer.innerHTML = '';
    const lights = devices.filter(d => d.type === 'light');
    lights.forEach(light => {
        const btn = createDeviceButton(light);
        lightsContainer.appendChild(btn);
    });
}

// Create a light button
function createDeviceButton(device) {
    const btn = document.createElement('button');
    btn.className = `btn m-2 device-btn light-btn`;
    btn.textContent = device.name;
    btn.dataset.id = device.device_id;
    btn.dataset.status = device.status;
    updateDeviceButtonAppearance(btn);

    btn.addEventListener('click', async () => {
        const updatedDevice = await makeApiCall(`/api/devices/${device.device_id}`);
        showLightControlModal(updatedDevice);
    });
    
    return btn;
}

// Update button style
function updateDeviceButtonAppearance(button) {
    const isOn = button.dataset.status === 'on';
    button.className = isOn ? 
        'btn btn-warning m-2 device-btn light-btn' : 
        'btn btn-secondary m-2 device-btn light-btn';
}

// Toggle light
async function toggleDevice(deviceId) {
    const id = Number(deviceId);
    const result = await makeApiCall(`/api/devices/${id}/toggle`, 'POST');
    return result.status;
}
// Update brightness
async function updateBrightness(deviceId, brightness) {
    const id = Number(deviceId);
    await makeApiCall(`/api/devices/${id}/brightness`, 'POST', { brightness });
}

// Show light control modal
function showLightControlModal(light) {
    const modal = document.getElementById('light-control-modal');
    const toggleBtn = document.getElementById('toggle-light');
    const deleteBtn = document.getElementById('delete-light');
    const dimmer = document.getElementById('dimmer');
    const dimmerValue = document.getElementById('dimmer-value');

    toggleBtn.textContent = light.status === 'off' ? 'Turn On' : 'Turn Off';
    toggleBtn.className = light.status === 'off' ? 'btn btn-success' : 'btn btn-danger';
    dimmer.disabled = light.status === 'off';
    dimmer.value = light.brightness || 100;
    dimmerValue.textContent = `${dimmer.value}%`;

    toggleBtn.onclick = async () => {
        const newStatus = await toggleDevice(light.device_id);
        const btn = document.querySelector(`.light-btn[data-id="${light.device_id}"]`);
        if (btn) {
            btn.dataset.status = newStatus;
            updateDeviceButtonAppearance(btn);
            toggleBtn.textContent = newStatus === 'off' ? 'Turn On' : 'Turn Off';
            toggleBtn.className = newStatus === 'off' ? 'btn btn-success' : 'btn btn-danger';
            dimmer.disabled = newStatus === 'off';
        }
    };

    deleteBtn.onclick = async () => {
        if (confirm('Delete this light?')) {
            await makeApiCall(`/api/devices/${light.device_id}`, 'DELETE');
            const btn = document.querySelector(`.light-btn[data-id="${light.device_id}"]`);
            if (btn) btn.remove();
            modal.style.display = 'none';
            await loadDevices();
        }
    };

    let dimmerTimeout;

    dimmer.oninput = () => {
        dimmerValue.textContent = `${dimmer.value}%`;

        if (dimmerTimeout) clearTimeout(dimmerTimeout);

        dimmerTimeout = setTimeout(async () => {
            await updateBrightness(light.device_id, parseInt(dimmer.value));
        }, 300); // чакай 300ms преди да пратиш заявка
    };


    modal.style.display = 'block';
}

// Page init
document.addEventListener('DOMContentLoaded', async () => {
    if (!authToken || !currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('room-header').textContent = localStorage.getItem('selectedRoom') || 'Room Control';

    document.getElementById('back-btn').addEventListener('click', () => {
        localStorage.removeItem('selectedRoom');
        window.location.href = 'mainPage.html';
    });

    if (roomId) {
        await loadDevices();
    } else {
        alert('No room selected');
        window.location.href = 'mainPage.html';
        return;
    }

    // Add light button
    document.getElementById('btn-add-light').addEventListener('click', async () => {
        const name = prompt('Enter light name:');
        if (name) {
            try {
                await makeApiCall(`/api/rooms/${roomId}/devices`, 'POST', {
                    name,
                    type: 'light',
                    status: 'off',
                    brightness: 100
                });
                await loadDevices();
            } catch (error) {
                alert('Failed to add light: ' + error.message);
            }
        }
    });

    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('light-control-modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('light-control-modal')) {
            document.getElementById('light-control-modal').style.display = 'none';
        }
    });
    
    // Thermostat logic
    let targetTemperature = parseInt(document.getElementById('targeted-temperature').textContent);

    document.getElementById('btn-temp-up').addEventListener('click', async () => {
        targetTemperature++;
        await updateTargetTemperature();
    });

    document.getElementById('btn-temp-down').addEventListener('click', async () => {
        targetTemperature--;
        await updateTargetTemperature();
    });

    async function updateTargetTemperature() {
        document.getElementById('targeted-temperature').textContent = targetTemperature;
        try {
            await makeApiCall(`/api/rooms/${roomId}/thermostat`, 'POST', {
                target_temperature: targetTemperature
            });
        } catch (error) {
            alert('Failed to update thermostat!');
        }
    }

});
