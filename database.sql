-- Create database if not exists
CREATE DATABASE IF NOT EXISTS classroom_booking_db;
USE classroom_booking_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('admin', 'dosen') NOT NULL DEFAULT 'dosen',
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('Kelas', 'Lab') NOT NULL,
  capacity INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_room_date (room_id, date),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Insert sample data
INSERT INTO users (name, email, role) VALUES 
('Admin User', 'admin@kampus.ac.id', 'admin'),
('Dr. Ahmad', 'ahmad@kampus.ac.id', 'dosen'),
('Dr. Siti', 'siti@kampus.ac.id', 'dosen');

INSERT INTO rooms (name, type, capacity) VALUES 
('Ruang 101', 'Kelas', 40),
('Ruang 102', 'Kelas', 35),
('Lab Komputer', 'Lab', 30),
('Lab Teknik', 'Lab', 25);
