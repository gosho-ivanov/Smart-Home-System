document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const saveRoomBtn = document.getElementById('save-room');
    const roomContainer = document.getElementById('room-container');
    const exitModalBtn = document.getElementById('exit-modal');
    const cameraBtn = document.getElementById('camera-btn');
    const cameraWindow = document.getElementById('camera-window');
    const closeCameraWindowBtn = document.getElementById('close-camera-window');

    // JSON array to store rooms
    let rooms = [];

    // Show the modal when the "Create a Room" button is clicked
    createRoomBtn.addEventListener('click', function () {
        modal.style.display = 'block';
        document.getElementById('room-name').focus();
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

        // Add the room to the JSON array
        const newRoom = { id: rooms.length + 1, name: roomName };
        rooms.push(newRoom);

        // Update the room container
        addRoomToContainer(newRoom);

        // Clear the input and hide the modal
        document.getElementById('room-name').value = '';
        modal.style.display = 'none';

        // Log the JSON array for debugging
        console.log('Rooms:', rooms);
    });

    // Function to add a room to the container
    function addRoomToContainer(room) {
        const newRoomButton = document.createElement('button');
        newRoomButton.className = 'room-btn btn btn-primary btn-block';
        newRoomButton.style.marginBottom = '10px';
        newRoomButton.textContent = room.name;

        // Add click event to navigate to the room page
        newRoomButton.addEventListener('click', function () {
            // Store the room name in localStorage
            localStorage.setItem('selectedRoom', room.name);

            // Redirect to the room page
            window.location.href = 'roomPage.html';
        });

        roomContainer.appendChild(newRoomButton);
    }

    // Camera Window
    cameraBtn.addEventListener('click', () => {
        cameraWindow.style.display = 'block';
    });

    closeCameraWindowBtn.addEventListener('click', () => {
        cameraWindow.style.display = 'none';
    });
});

document.getElementById('show-window-btn').addEventListener('click', () => {
    const blankWindow = document.getElementById('blank-window');
    blankWindow.style.display = 'block';
});

document.getElementById('close-window-btn').addEventListener('click', () => {
    const blankWindow = document.getElementById('blank-window');
    blankWindow.style.display = 'none';
});
