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
        cursor = None
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, (user_id, name))
            room_id = cursor.lastrowid

            # Create thermostat device
            device_query = """
            INSERT INTO devices (room_id, name, type, status)
            VALUES (%s, %s, 'thermostat', 'on')
            """
            cursor.execute(device_query, (room_id, f"{name} Thermostat"))
            device_id = cursor.lastrowid

            # Add thermostat data
            thermostat_query = """
            INSERT INTO thermostats (thermostat_id, current_temperature, target_temperature)
            VALUES (%s, %s, %s)
            """
            cursor.execute(thermostat_query, (device_id, 22.0, 24.0))

            self.connection.commit()
            return room_id
        except Error as e:
            print(f"Error creating room and thermostat: {e}")
            self.connection.rollback()
            return None
        finally:
            if cursor:
                cursor.close()

    def get_user_rooms(self, user_id):
        query = "SELECT * FROM rooms WHERE user_id = %s"
        return self.execute_query(query, (user_id,), fetch=True)
    
    def delete_room(self, room_id, user_id):
        query = "DELETE FROM rooms WHERE room_id = %s AND user_id = %s"
        return self.execute_query(query, (room_id, user_id))

    
    # Device management

    def get_device_by_id(self, device_id):
        query = """
        SELECT d.*, l.brightness
        FROM devices d
        LEFT JOIN lights l ON d.device_id = l.light_id
        WHERE d.device_id = %s
        """
        results = self.execute_query(query, (device_id,), fetch=True)
        if results:
            return results[0]
        else:
            return None



    # Add a light or socket to a room
    def add_device(self, room_id, name, device_type, status='off', brightness=None):
        cursor = None
        try:
            cursor = self.connection.cursor()
            query = """
            INSERT INTO devices (room_id, name, type, status)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (room_id, name, device_type, status))
            device_id = cursor.lastrowid

            if device_type == 'light':
                brightness = brightness or 100
                self.execute_query(
                    "INSERT INTO lights (light_id, brightness) VALUES (%s, %s)",
                    (device_id, brightness)
                )
            elif device_type == 'thermostat':
                self.execute_query(
                    "INSERT INTO thermostats (thermostat_id, current_temperature, target_temperature) VALUES (%s, %s, %s)",
                    (device_id, 22.0, 24.0)
                )

            self.connection.commit()
            return device_id
        except Error as e:
            print(f"Error adding device: {e}")
            return None
        finally:
            if cursor: cursor.close()

    #Update thermostat target temperature
    def update_room_thermostat(self, room_id, target_temp):
        query = """
        UPDATE thermostats
        SET target_temperature = %s
        WHERE thermostat_id = (
            SELECT device_id FROM devices
            WHERE room_id = %s AND type = 'thermostat'
            LIMIT 1
        )
        """
        return self.execute_query(query, (target_temp, room_id))



    #Toggle device status (on/off)
    def toggle_device(self, device_id):
        cursor = None
        try:
            cursor = self.connection.cursor(dictionary=True)
            
            # Get current status
            cursor.execute("SELECT status FROM devices WHERE device_id = %s", (device_id,))
            device = cursor.fetchone()

            if not device:
                raise ValueError("Device not found")

            current_status = device['status']
            new_status = 'off' if current_status == 'on' else 'on'

            # Update status in DB
            cursor.execute(
                "UPDATE devices SET status = %s WHERE device_id = %s",
                (new_status, device_id)
            )
            self.connection.commit()
            return new_status  # Returns just the status string ('on' or 'off')

        except Error as e:
            self.connection.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
    # Get all devices in a room (including brightness for lights)
    def get_room_devices(self, room_id):
        query = """
        SELECT d.*, l.brightness
        FROM devices d
        LEFT JOIN lights l ON d.device_id = l.light_id
        WHERE d.room_id = %s
        """
        return self.execute_query(query, (room_id,), fetch=True)

    # Set brightness for a light
    def set_device_brightness(self, device_id, brightness):
        query = "UPDATE lights SET brightness = %s WHERE light_id = %s"
        return self.execute_query(query, (brightness, device_id))

    # Delete a device (and from its type-specific table if needed)
    def delete_device(self, device_id):
        # Delete from light or thermostat if exists
        self.execute_query("DELETE FROM lights WHERE light_id = %s", (device_id,))
        self.execute_query("DELETE FROM thermostats WHERE thermostat_id = %s", (device_id,))
        return self.execute_query("DELETE FROM devices WHERE device_id = %s", (device_id,))

# Example usage
if __name__ == "__main__":
    db = SmartHomeDB()
    
    # Test connection
    rooms = db.get_user_rooms(1)
    print("User rooms:", json.dumps(rooms, indent=2))
    
    # Close connection
    db.disconnect()