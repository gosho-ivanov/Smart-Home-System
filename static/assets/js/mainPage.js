document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const saveRoomBtn = document.getElementById('save-room');
    const roomContainer = document.getElementById('room-container');
    const exitModalBtn = document.getElementById('exit-modal');
    const cameraBtn = document.getElementById('camera-btn');
    const cameraWindow = document.getElementById('camera-window');
    const closeCameraWindowBtn = document.getElementById('close-camera-window');

    // Logout button functionality
    document.getElementById('logout-btn').addEventListener('click', function () {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('selectedRoom');
            window.location.href = '/login';
        }
    });

    // Sample rooms data (would normally come from backend)
    let rooms = [];

    // Initialize the room container with sample rooms
    async function initializeRooms() {
        try {
            const token = localStorage.getItem('token'); // Get the token from local storage
            if (!token) {
                alert('You are not logged in. Redirecting to login page.');
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/rooms', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rooms from the backend');
            }

            const roomsData = await response.json();

            // Normalize rooms to ensure they all have 'id' property
            rooms = roomsData.map(room => ({
                id: room.room_id || room.id,
                name: room.name
            }));

            // Add each room to the container
            rooms.forEach(room => {
                addRoomToContainer(room);
            });
        } catch (error) {
            console.error('Error loading rooms:', error);
            alert('Failed to load rooms. Please try again later.');
        }
    }

    // Show the modal when the "Create a Room" button is clicked
    createRoomBtn.addEventListener('click', function () {
        modal.style.display = 'block';
        document.getElementById('room-name').focus();
    });

    // Hide the modal when clicking outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Hide the modal when the "Exit" button is clicked
    exitModalBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Handle the save room button click
    saveRoomBtn.addEventListener('click', async function () {
        const roomName = document.getElementById('room-name').value.trim();
        if (!roomName) {
            alert('Please enter a room name.');
            return;
        }
        const thermostatPort = document.getElementById('thermostat-port').value.trim();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: roomName
                , thermostat_port: thermostatPort || null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const newRoom = await response.json();
            rooms.push({ id: newRoom.room_id, name: roomName });

            // Update the room container
            addRoomToContainer({ id: newRoom.room_id, name: roomName });

            // Clear the input and hide the modal
            document.getElementById('room-name').value = '';
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        }
    });

    // Function to add a room to the container
    function addRoomToContainer(room) {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-btn';
        roomCard.innerHTML = `
            <span>${room.name}</span>
            <div class="room-icon">🏠</div>
            <button class="delete-room btn btn-danger btn-sm">Delete</button>
        `;
    
        // Navigate to room page
        // Add click event to the entire card (excluding delete button)
        roomCard.addEventListener('click', function (e) {
            if (e.target.closest('.delete-room')) return; // Don't trigger when clicking delete
            localStorage.setItem('selectedRoom', room.name);
            window.location.href = `roomPage.html?roomId=${room.id}`;
        });

    
        // Handle deletion
        roomCard.querySelector('.delete-room').addEventListener('click', async function (e) {
            e.stopPropagation(); // prevent navigating to room page
            if (!confirm(`Delete room "${room.name}"?`)) return;
    
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/rooms/${room.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
    
                if (!response.ok) throw new Error('Failed to delete room');
                roomCard.remove(); // Remove from DOM
            } catch (err) {
                alert('Error deleting room. Try again.');
                console.error(err);
            }
        });
    
        roomContainer.appendChild(roomCard);
    
        // Animation
        roomCard.style.opacity = '0';
        setTimeout(() => {
            roomCard.style.transition = 'opacity 0.3s ease';
            roomCard.style.opacity = '1';
        }, 10);
    }
    

    // Camera Window
    cameraBtn.addEventListener('click', () => {
        cameraWindow.style.display = 'block';
    });

    closeCameraWindowBtn.addEventListener('click', () => {
        cameraWindow.style.display = 'none';
    });

    // Close camera window when clicking outside
    cameraWindow.addEventListener('click', function(e) {
        if (e.target === cameraWindow) {
            cameraWindow.style.display = 'none';
        }
    });

    // Initialize rooms on page load
    initializeRooms();
});