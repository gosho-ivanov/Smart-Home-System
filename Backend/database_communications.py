import mysql.connector
from mysql.connector import Error
import json

class SmartHomeDB:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host='localhost',
                database='smart_home_system',
                user='root',
                password='2Bme6AqgzU5xLq'
            )
            if self.connection.is_connected():
                print("Connected to MySQL database")
        except Error as e:
            print(f"Error while connecting to MySQL: {e}")
    
    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection is closed")
    
    def execute_query(self, query, params=None, fetch=False):
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
                return result
            else:
                self.connection.commit()
                return cursor.rowcount
        except Error as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            if cursor: cursor.close()
    
    # User management
    def create_user(self, username, email, password_hash):
        query = """
        INSERT INTO users (username, email, password_hash)
        VALUES (%s, %s, %s)
        """
        return self.execute_query(query, (username, email, password_hash))
    
    def get_user(self, email):
        query = "SELECT * FROM users WHERE email = %s"
        return self.execute_query(query, (email,), fetch=True)
    
    # Room management
    def create_room(self, user_id, name):
        query = "INSERT INTO rooms (user_id, name) VALUES (%s, %s)"
        return self.execute_query(query, (user_id, name))
    
    def get_user_rooms(self, user_id):
        query = "SELECT * FROM rooms WHERE user_id = %s"
        return self.execute_query(query, (user_id,), fetch=True)
    
    def delete_room(self, room_id, user_id):
        query = "DELETE FROM rooms WHERE room_id = %s AND user_id = %s"
        self.cursor.execute(query, (room_id, user_id))
        self.connection.commit()
        return self.cursor.rowcount  # Returns the number of rows affected
    
    # Device management
    def add_device(self, room_id, name, device_type, status='off'):
        query = """
        INSERT INTO devices (room_id, name, type, status)
        VALUES (%s, %s, %s, %s)
        """
        device_id = self.execute_query(query, (room_id, name, device_type, status))
        
        if device_type == 'light':
            self.execute_query(
                "INSERT INTO lights (light_id, brightness) VALUES (%s, %s)",
                (device_id, 100)
            )
        elif device_type == 'thermostat':
            self.execute_query(
                "INSERT INTO thermostats (thermostat_id, current_temperature, target_temperature) VALUES (%s, %s, %s)",
                (device_id, 22.0, 24.0)
            )
        
        return device_id
    
    def get_room_devices(self, room_id):
        query = "SELECT * FROM devices WHERE room_id = %s"
        return self.execute_query(query, (room_id,), fetch=True)
    
    def toggle_device(self, device_id):
        query = "CALL ToggleDeviceStatus(%s)"
        return self.execute_query(query, (device_id,), fetch=True)

# Example usage
if __name__ == "__main__":
    db = SmartHomeDB()
    
    # Test connection
    rooms = db.get_user_rooms(1)
    print("User rooms:", json.dumps(rooms, indent=2))
    
    # Close connection
    db.disconnect()