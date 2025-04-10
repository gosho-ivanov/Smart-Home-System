CREATE DATABASE smart_home_system;
USE smart_home_system;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Rooms tablebooksPRIMARYbook_id
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Devices table (base table for all devices)
CREATE TABLE devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('light', 'socket', 'thermostat', 'camera') NOT NULL,
    status ENUM('on', 'off') DEFAULT 'off',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Lights table (extends devices)
CREATE TABLE lights (
    light_id INT PRIMARY KEY,
    brightness INT DEFAULT 100 CHECK (brightness BETWEEN 0 AND 100),
    color_temperature INT,
    FOREIGN KEY (light_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Sockets table (extends devices)
CREATE TABLE sockets (
    socket_id INT PRIMARY KEY,
    power_consumption FLOAT,
    FOREIGN KEY (socket_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Thermostats table (extends devices)
CREATE TABLE thermostats (
    thermostat_id INT PRIMARY KEY,
    current_temperature FLOAT NOT NULL,
    target_temperature FLOAT NOT NULL,
    mode ENUM('heat', 'cool', 'auto', 'off') DEFAULT 'auto',
    FOREIGN KEY (thermostat_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Cameras table (extends devices)
CREATE TABLE cameras (
    camera_id INT PRIMARY KEY,
    is_streaming BOOLEAN DEFAULT FALSE,
    last_motion_detection TIMESTAMP NULL,
    FOREIGN KEY (camera_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Automation rules
CREATE TABLE automations (
    automation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    trigger_device_id INT,
    trigger_condition VARCHAR(255),
    action_device_id INT NOT NULL,
    action_command VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (trigger_device_id) REFERENCES devices(device_id) ON DELETE SET NULL,
    FOREIGN KEY (action_device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Activity log
CREATE TABLE activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    device_id INT,
    action VARCHAR(255) NOT NULL,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE SET NULL
);
USE smart_home_system;
SELECT * FROM users;