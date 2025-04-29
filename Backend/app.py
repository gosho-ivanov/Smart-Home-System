from flask import Flask, request, jsonify
from database_communications import SmartHomeDB
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import jwt
import datetime 
from functools import wraps
from mysql.connector import Error

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production!

db = SmartHomeDB()

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.get_user(data['email'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user[0], *args, **kwargs)
    return decorated

# User Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    try:
        db.create_user(data['username'], data['email'], hashed_password)
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = db.get_user(data['email'])
    
    if not user or not check_password_hash(user[0]['password_hash'], data['password']):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    token = jwt.encode({
        'email': user[0]['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({'token': token, 'user_id': user[0]['user_id']})

# Room Routes
@app.route('/api/rooms', methods=['GET', 'POST'])
@token_required
def rooms(current_user):
    if request.method == 'GET':
        rooms = db.get_user_rooms(current_user['user_id'])
        return jsonify(rooms)
    elif request.method == 'POST':
        data = request.get_json()
        room_id = db.create_room(current_user['user_id'], data['name'])
        return jsonify({'room_id': room_id}), 201

@app.route('/api/rooms/<int:room_id>', methods=['DELETE'])
@token_required
def delete_room(current_user, room_id):
    try:
        # Call the database function to delete the room
        rows_deleted = db.delete_room(room_id, current_user['user_id'])
        
        if rows_deleted == 0:
            return jsonify({'message': 'Room not found or not authorized to delete'}), 404
        
        return jsonify({'message': 'Room deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to delete room', 'error': str(e)}), 500

# Device Routes
@app.route('/api/rooms/<int:room_id>/devices', methods=['GET', 'POST'])
@token_required
def room_devices(current_user, room_id):
    if request.method == 'GET':
        devices = db.get_room_devices(room_id)
        return jsonify(devices)
    elif request.method == 'POST':
        data = request.get_json()
        brightness = data.get('brightness', 100) if data['type'] == 'light' else None
        device_id = db.add_device(
            room_id, 
            data['name'], 
            data['type'], 
            data.get('status', 'off'),
            brightness
        )
        return jsonify({'device_id': device_id}), 201

@app.route('/api/devices/<int:device_id>', methods=['GET'])
@token_required
def get_device(current_user, device_id):
    device = db.get_device_by_id(device_id)
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    return jsonify(device)


@app.route('/api/devices/<int:device_id>/toggle', methods=['POST'])
@token_required
def toggle_device(current_user, device_id):
    try:
        db = SmartHomeDB()
        new_status = db.toggle_device(device_id)
        return jsonify({'status': new_status})  # Directly use the string
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Error as e:
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/devices/<int:device_id>/brightness', methods=['POST'])
@token_required
def set_brightness(current_user, device_id):
    data = request.get_json()
    brightness = data.get('brightness')
    if brightness is None:
        return jsonify({'message': 'Brightness not provided'}), 400
    try:
        db.set_device_brightness(device_id, brightness)
        return jsonify({'message': 'Brightness updated'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to update brightness', 'error': str(e)}), 500

@app.route('/api/devices/<int:device_id>', methods=['DELETE'])
@token_required
def delete_device(current_user, device_id):
    try:
        db.delete_device(device_id)
        return jsonify({'message': 'Device deleted'}), 200
    except Exception as e:
        return jsonify({'message': 'Error deleting device', 'error': str(e)}), 500
    
@app.route('/api/rooms/<int:room_id>/thermostat', methods=['POST'])
@token_required
def update_thermostat(current_user, room_id):
    data = request.get_json()
    target_temp = data.get('target_temperature')
    if target_temp is None:
        return jsonify({'error': 'Missing target temperature'}), 400

    db.update_room_thermostat(room_id, target_temp)
    return jsonify({'message': 'Target temperature updated'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)