package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"classroom-booking-system/internal/models"
	"classroom-booking-system/internal/repository"
	"database/sql"
)

// Get all rooms
func GetRooms(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rooms, err := repository.GetRooms(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, rooms)
	}
}

// Create room
func CreateRoom(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var room models.Room
		if err := c.ShouldBindJSON(&room); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := repository.CreateRoom(db, &room); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, room)
	}
}

// Get all bookings
func GetBookings(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		bookings, err := repository.GetBookings(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, bookings)
	}
}

// Create booking
func CreateBooking(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var booking models.Booking
		if err := c.ShouldBindJSON(&booking); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check conflict
		hasConflict, err := repository.CheckConflict(db, booking.RoomID, booking.StartTime, booking.EndTime)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if hasConflict {
			c.JSON(http.StatusConflict, gin.H{"error": "Schedule conflict detected"})
			return
		}

		booking.Status = "pending"
		if err := repository.CreateBooking(db, &booking); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, booking)
	}
}

// Approve booking
func ApproveBooking(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}
		if err := repository.ApproveBooking(db, id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Booking approved"})
	}
}

// Reject booking
func RejectBooking(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}
		if err := repository.RejectBooking(db, id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Booking rejected"})
	}
}
