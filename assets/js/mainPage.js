document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const closeBtn = document.querySelector('.close-btn');
    const saveRoomBtn = document.getElementById('save-room');
    const roomContainer = document.getElementById('room-container');

    // Load rooms from localStorage on page load
    const savedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
    savedRooms.forEach(roomName => addRoomToContainer(roomName));

    // Show the modal when the "Create a room" button is clicked
    createRoomBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });

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

    // Handle the save room button click
    saveRoomBtn.addEventListener('click', function() {
        const roomName = document.getElementById('room-name').value;
        if (roomName) {
            // Add the new room to the room container
            addRoomToContainer(roomName);

            // Save to localStorage
            savedRooms.push(roomName);
            localStorage.setItem('rooms', JSON.stringify(savedRooms));

            // Hide the modal
            modal.style.display = 'none';

            // Clear the input field
            document.getElementById('room-name').value = '';
        } else {
            alert('Please enter a room name.');
        }
    });

    // Event delegation for dynamically added buttons
    roomContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('room-btn')) {
            const roomName = event.target.getAttribute('data-room-name');
            window.location.href = `roomPage.html?roomName=${encodeURIComponent(roomName)}`;
        }

        // Handle Delete button click
        if (event.target.classList.contains('delete-btn')) {
            const roomName = event.target.getAttribute('data-room-name');
            deleteRoom(roomName);
        }
    });

    // Function to add a room to the container
    function addRoomToContainer(roomName) {
        const newRoom = document.createElement('div');
        newRoom.className = 'room';
        newRoom.innerHTML = `
            <h2>${roomName}</h2>
            <button class="room-btn" data-room-name="${roomName}">View</button>
            <button class="delete-btn" data-room-name="${roomName}">Delete</button>
        `;
        roomContainer.appendChild(newRoom);
    }

    // Function to delete a room
    function deleteRoom(roomName) {
        // Remove from room container
        const roomElements = document.querySelectorAll('.room');
        roomElements.forEach(room => {
            if (room.querySelector('.delete-btn').getAttribute('data-room-name') === roomName) {
                room.remove();
            }
        });

        // Remove from localStorage
        const updatedRooms = savedRooms.filter(room => room !== roomName);
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));

        // Update the savedRooms array
        savedRooms.length = 0;
        savedRooms.push(...updatedRooms);
    }
});
