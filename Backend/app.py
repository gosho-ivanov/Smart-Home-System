from flask import Flask, request, jsonify
from database_communications import SmartHomeDB
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
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
            current_user = db.get_user(data['username'])
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

# Device Routes
@app.route('/api/rooms/<int:room_id>/devices', methods=['GET', 'POST'])
@token_required
def room_devices(current_user, room_id):
    if request.method == 'GET':
        devices = db.get_room_devices(room_id)
        return jsonify(devices)
    elif request.method == 'POST':
        data = request.get_json()
        device_id = db.add_device(
            room_id, 
            data['name'], 
            data['type'], 
            data.get('status', 'off')
        )
        return jsonify({'device_id': device_id}), 201

@app.route('/api/devices/<int:device_id>/toggle', methods=['POST'])
@token_required
def toggle_device(current_user, device_id):
    result = db.toggle_device(device_id)
    return jsonify({'status': result[0]['result']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)