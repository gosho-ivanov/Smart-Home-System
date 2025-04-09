document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const saveRoomBtn = document.getElementById('save-room');
    const roomContainer = document.getElementById('room-container');
    const exitModalBtn = document.getElementById('exit-modal');
    const cameraBtn = document.getElementById('camera-btn');
    const cameraWindow = document.getElementById('camera-window');
    const closeCameraWindowBtn = document.getElementById('close-camera-window');

    // Sample rooms data (would normally come from backend)
    let rooms = [];

    // Initialize the room container with sample rooms
    function initializeRooms() {
        rooms.forEach(room => {
            addRoomToContainer(room);
        });
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
    saveRoomBtn.addEventListener('click', function () {
        const roomName = document.getElementById('room-name').value.trim();
        if (!roomName) {
            alert('Please enter a room name.');
            return;
        }

        // Add the room to the array
        const newRoom = { 
            id: Date.now(), // Use timestamp as unique ID
            name: roomName 
        };
        rooms.push(newRoom);

        // Update the room container
        addRoomToContainer(newRoom);

        // Clear the input and hide the modal
        document.getElementById('room-name').value = '';
        modal.style.display = 'none';
    });

    // Function to add a room to the container
    function addRoomToContainer(room) {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-btn';
        roomCard.innerHTML = `
            <span>${room.name}</span>
            <div class="room-icon">🏠</div>
        `;

        // Add click event to navigate to the room page
        roomCard.addEventListener('click', function () {
            localStorage.setItem('selectedRoom', room.name);
            window.location.href = 'roomPage.html';
        });

        roomContainer.appendChild(roomCard);
        
        // Add animation
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