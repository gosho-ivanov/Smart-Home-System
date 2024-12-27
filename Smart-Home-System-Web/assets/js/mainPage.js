document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    const createRoomBtn = document.getElementById('create-room-btn');
    const closeBtn = document.querySelector('.close-btn');
    const saveRoomBtn = document.getElementById('save-room');
    const roomContainer = document.getElementById('room-container');

    // Load rooms from the database on page load
    fetch('/rooms')
        .then(response => response.json())
        .then(rooms => {
            rooms.forEach(room => addRoomToContainer(room));
        })
        .catch(error => console.error('Error fetching rooms:', error));

    // Show the modal when the "Create a room" button is clicked
    createRoomBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        document.getElementById('room-name').focus();
    });

    // Hide the modal when clicking outside of the modal content
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Handle the save room button click
    saveRoomBtn.addEventListener('click', function() {
        const roomName = document.getElementById('room-name').value.trim();
        if (!roomName) {
            alert('Please enter a room name.');
            return;
        }

        // Send POST request to the backend to save the room
        fetch('/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: roomName })
        })
        .then(response => response.json())
        .then(room => {
            addRoomToContainer(room);
            modal.style.display = 'none';
            document.getElementById('room-name').value = '';
        })
        .catch(error => console.error('Error saving room:', error));
    });

    // Event delegation for dynamically added buttons
    roomContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('room-btn')) {
            const roomName = event.target.getAttribute('data-room-name');
            window.location.href = `roomPage.html?roomName=${encodeURIComponent(roomName)}`;
        }

        if (event.target.classList.contains('delete-btn')) {
            const roomId = event.target.getAttribute('data-room-id');
            if (confirm('Are you sure you want to delete this room?')) {
                deleteRoom(roomId, event.target.closest('.room'));
            }
        }
    });

    // Function to add a room to the container
    function addRoomToContainer(room) {
        const newRoom = document.createElement('div');
        newRoom.className = 'room';
        newRoom.innerHTML = `
            <h2>${room.name}</h2>
            <button class="room-btn" data-room-name="${room.name}">View</button>
            <button class="delete-btn" data-room-id="${room.id}">Delete</button>
        `;
        roomContainer.appendChild(newRoom);
    }

    // Function to delete a room
    function deleteRoom(roomId, roomElement) {
        fetch(`/rooms/${roomId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                roomElement.remove();
            } else {
                console.error('Error deleting room');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
