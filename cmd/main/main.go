package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/galihmawardi-maker/classroom-booking-system/internal/config"
	"github.com/galihmawardi-maker/classroom-booking-system/internal/handler"
	"github.com/galihmawardi-maker/classroom-booking-system/internal/repository"
	"github.com/galihmawardi-maker/classroom-booking-system/internal/service"
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

	// Initialize repositories
	roomRepo := repository.NewRoomRepository(db)
	bookingRepo := repository.NewBookingRepository(db)
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	roomService := service.NewRoomService(roomRepo)
	bookingService := service.NewBookingService(bookingRepo, roomRepo)
	userService := service.NewUserService(userRepo)

	// Initialize handlers
	roomHandler := handler.NewRoomHandler(roomService)
	bookingHandler := handler.NewBookingHandler(bookingService)
	userHandler := handler.NewUserHandler(userService)

	// Setup routes
	router := mux.NewRouter()

	// Room endpoints
	router.HandleFunc("/api/rooms", roomHandler.GetAllRooms).Methods("GET")
	router.HandleFunc("/api/rooms", roomHandler.CreateRoom).Methods("POST")
	router.HandleFunc("/api/rooms/{id}", roomHandler.GetRoomByID).Methods("GET")
	router.HandleFunc("/api/rooms/{id}", roomHandler.UpdateRoom).Methods("PUT")
	router.HandleFunc("/api/rooms/{id}", roomHandler.DeleteRoom).Methods("DELETE")

	// Booking endpoints
	router.HandleFunc("/api/bookings", bookingHandler.GetAllBookings).Methods("GET")
	router.HandleFunc("/api/bookings", bookingHandler.CreateBooking).Methods("POST")
	router.HandleFunc("/api/bookings/{id}", bookingHandler.GetBookingByID).Methods("GET")
	router.HandleFunc("/api/bookings/{id}", bookingHandler.UpdateBooking).Methods("PUT")
	router.HandleFunc("/api/bookings/{id}", bookingHandler.DeleteBooking).Methods("DELETE")
	router.HandleFunc("/api/bookings/check-schedule", bookingHandler.CheckScheduleConflict).Methods("POST")

	// User endpoints
	router.HandleFunc("/api/users", userHandler.GetAllUsers).Methods("GET")
	router.HandleFunc("/api/users", userHandler.CreateUser).Methods("POST")
	router.HandleFunc("/api/users/{id}", userHandler.GetUserByID).Methods("GET")

	// Reports
	router.HandleFunc("/api/reports/monthly", bookingHandler.GenerateMonthlyReport).Methods("GET")

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Starting server on :%s\n", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
