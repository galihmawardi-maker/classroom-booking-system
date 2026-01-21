package main

import (
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"classroom-booking-system/internal/config"
	"classroom-booking-system/internal/handler"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database connection
	db, err := config.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Setup Gin router
	router := gin.Default()

	// Serve static files (dashboard)
	router.Static("/static", "./web")
	router.StaticFile("/", "./web/index.html")

	// Room endpoints
	router.GET("/api/rooms", handler.GetRooms(db))
	router.POST("/api/rooms", handler.CreateRoom(db))

	// Booking endpoints
	router.GET("/api/bookings", handler.GetBookings(db))
	router.POST("/api/bookings", handler.CreateBooking(db))
	router.POST("/api/bookings/:id/approve", handler.ApproveBooking(db))
	router.POST("/api/bookings/:id/reject", handler.RejectBooking(db))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	// Get server port from environment
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
