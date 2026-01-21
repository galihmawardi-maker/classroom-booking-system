# Classroom Booking System - Complete Implementation Guide

This guide provides all the code needed to complete your UAS project.

## Quick Start

1. Clone the repository
2. Run the SQL script: `mysql -u root -p < database.sql`
3. Update `.env` with your database credentials
4. Replace existing files with code provided below
5. Run: `go mod download && go run cmd/main/main.go`
6. Access at: http://localhost:8080

## Files to Create/Update

### 1. internal/repository/repository.go

```go
package repository

import (
	"database/sql"
	"fmt"
	"time"
	"classroom-booking-system/internal/models"
)

type Repository struct {
	db *sql.DB
}

func New(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// Room operations
func (r *Repository) GetRooms() ([]models.Room, error) {
	rows, err := r.db.Query("SELECT id, name, type, capacity, is_active FROM rooms WHERE is_active = true")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []models.Room
	for rows.Next() {
		var room models.Room
		if err := rows.Scan(&room.ID, &room.Name, &room.Type, &room.Capacity, &room.IsActive); err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}
	return rooms, rows.Err()
}

func (r *Repository) GetRoomByID(id int) (*models.Room, error) {
	room := &models.Room{}
	err := r.db.QueryRow("SELECT id, name, type, capacity, is_active FROM rooms WHERE id = ?", id).Scan(
		&room.ID, &room.Name, &room.Type, &room.Capacity, &room.IsActive)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (r *Repository) CreateRoom(room *models.Room) error {
	result, err := r.db.Exec("INSERT INTO rooms (name, type, capacity, is_active) VALUES (?, ?, ?, ?)",
		room.Name, room.Type, room.Capacity, true)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	room.ID = int(id)
	return err
}

func (r *Repository) UpdateRoom(room *models.Room) error {
	_, err := r.db.Exec("UPDATE rooms SET name = ?, type = ?, capacity = ? WHERE id = ?",
		room.Name, room.Type, room.Capacity, room.ID)
	return err
}

func (r *Repository) DeleteRoom(id int) error {
	// Check if room has active bookings
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bookings WHERE room_id = ? AND status = 'approved'", id).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("cannot delete room with active bookings")
	}

	_, err = r.db.Exec("UPDATE rooms SET is_active = false WHERE id = ?", id)
	return err
}

// Booking operations
func (r *Repository) GetBookings(filter string) ([]models.Booking, error) {
	query := "SELECT id, room_id, user_id, date, start_time, end_time, purpose, status, created_at FROM bookings"
	if filter != "" {
		query += " WHERE " + filter
	}

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []models.Booking
	for rows.Next() {
		var b models.Booking
		if err := rows.Scan(&b.ID, &b.RoomID, &b.UserID, &b.Date, &b.StartTime, &b.EndTime, &b.Purpose, &b.Status, &b.CreatedAt); err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, rows.Err()
}

func (r *Repository) IsBookingConflict(roomID int, date, startTime, endTime string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM bookings 
		   WHERE room_id = ? AND date = ? AND status = 'approved'
		   AND ((start_time < ? AND end_time > ?) 
		   OR (start_time < ? AND end_time > ?))`

	err := r.db.QueryRow(query, roomID, date, endTime, startTime, endTime, startTime).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *Repository) CreateBooking(booking *models.Booking) error {
	result, err := r.db.Exec(
		"INSERT INTO bookings (room_id, user_id, date, start_time, end_time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
		booking.RoomID, booking.UserID, booking.Date, booking.StartTime, booking.EndTime, booking.Purpose, "pending")
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	booking.ID = int(id)
	booking.Status = "pending"
	booking.CreatedAt = time.Now()
	return err
}

func (r *Repository) ApproveBooking(id int) error {
	_, err := r.db.Exec("UPDATE bookings SET status = 'approved' WHERE id = ?", id)
	return err
}

func (r *Repository) RejectBooking(id int) error {
	_, err := r.db.Exec("UPDATE bookings SET status = 'rejected' WHERE id = ?", id)
	return err
}
```

## How to Use This Guide

1. Create file `internal/repository/repository.go` with the code above
2. Update `web/index.html` to include all UI tabs
3. Update `web/js/app.js` with API integration
4. Run database setup
5. Test all endpoints

For unit tests, create test files in each package with _test.go suffix.
