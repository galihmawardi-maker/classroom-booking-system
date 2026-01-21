# Classroom Booking System

**Sistem Pemesanan Ruang Kelas & Lab - UAS Pemrograman Dasar 2**

Aplikasi REST API untuk manajemen pemesanan ruang kelas dan laboratorium. Dibangun dengan Go, MySQL, dan implementasi pola arsitektur clean code.

## Features

### 1. Room Management
- ✅ CRUD operation untuk ruang (kelas & lab)
- ✅ Tracking kapasitas dan fasilitas
- ✅ Status availability real-time
- ✅ Kategorisasi ruang (Kelas, Lab Komputer, Lab Teknik, dll)

### 2. Booking Management  
- ✅ Create, Read, Update, Delete pemesanan
- ✅ Validasi pemesanan mendalam
- ✅ **Deteksi bentrok jadwal otomatis**
- ✅ Track peminjam dan waktu pemesanan
- ✅ Support pemesanan berulang

### 3. Schedule Conflict Detection
- ✅ Cek otomatis benturan jadwal sebelum booking
- ✅ Validasi waktu mulai & selesai
- ✅ Alert untuk pemesanan yang overlapping
- ✅ History lengkap pemesanan

### 4. Monthly Report Generation
- ✅ Export laporan JSON & CSV
- ✅ Analisis penggunaan ruang bulanan
- ✅ Statistik booking per ruang
- ✅ Identifikasi peak hours penggunaan

### 5. User Management
- ✅ Authentication user (dosen, mahasiswa, staff)
- ✅ Role-based access control
- ✅ Track peminjam ruang

## Technology Stack

- **Language**: Go 1.21
- **Framework**: Gorilla Mux (HTTP router)
- **Database**: MySQL 5.7+
- **Dependencies**:
  - `github.com/go-sql-driver/mysql` - MySQL driver
  - `github.com/gorilla/mux` - HTTP routing
  - `github.com/joho/godotenv` - Environment variable management

## Project Structure

```
classroom-booking-system/
├── cmd/
│   └── main/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/
│   │   └── database.go          # Database connection & initialization
│   ├── models/
│   │   ├── room.go              # Room entity
│   │   ├── booking.go           # Booking entity
│   │   └── user.go              # User entity
│   ├── repository/
│   │   ├── room.go              # Room data access layer
│   │   ├── booking.go           # Booking data access layer
│   │   └── user.go              # User data access layer
│   ├── service/
│   │   ├── room.go              # Room business logic
│   │   ├── booking.go           # Booking business logic & conflict detection
│   │   └── user.go              # User business logic
│   ├── handler/
│   │   ├── room.go              # Room HTTP handlers
│   │   ├── booking.go           # Booking HTTP handlers
│   │   └── user.go              # User HTTP handlers
│   └── utils/
│       ├── response.go          # Standard response wrapper
│       ├── errors.go            # Custom error definitions
│       └── validator.go         # Input validation
├── migrations/
│   └── init.sql                 # Database schema
├── go.mod                       # Go module dependencies
├── go.sum                       # Dependency checksums
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- Go 1.21 or higher
- MySQL 5.7 or higher
- Git

### Steps

1. **Clone Repository**
```bash
git clone https://github.com/galihmawardi-maker/classroom-booking-system.git
cd classroom-booking-system
```

2. **Setup Environment Variables**
```bash
cp .env.example .env
# Edit .env dengan credentials MySQL Anda
```

3. **Install Dependencies**
```bash
go mod download
```

4. **Initialize Database**
```bash
# Import migrations/init.sql ke MySQL
mysql -u root -p < migrations/init.sql
```

5. **Run Application**
```bash
go run cmd/main/main.go
# Server akan berjalan di http://localhost:8080
```

## Database Schema

### Tables

**users**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('dosen', 'mahasiswa', 'staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**rooms**
```sql
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    facilities JSON,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**bookings**
```sql
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `POST /api/bookings` - Create new booking (with conflict check)
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking
- `POST /api/bookings/check-schedule` - Check schedule conflict

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user

### Reports
- `GET /api/reports/monthly?year=2024&month=1` - Get monthly report (JSON/CSV)

## Schedule Conflict Detection Logic

Sistem akan mendeteksi bentrok jadwal jika:
1. Ruang sama
2. Tanggal sama
3. Waktu overlap: `(start1 < end2) AND (start2 < end1)`

```go
func hasConflict(existingStart, existingEnd, newStart, newEnd time.Time) bool {
    return newStart.Before(existingEnd) && existingStart.Before(newEnd)
}
```

## Monthly Report Structure

```json
{
  "month": "2024-01",
  "total_bookings": 45,
  "total_rooms_used": 8,
  "peak_hour": "10:00-11:00",
  "room_statistics": [
    {
      "room_id": 1,
      "room_name": "Kelas A101",
      "bookings_count": 12,
      "utilization_rate": "75%"
    }
  ],
  "exported_at": "2024-02-01T10:30:00Z"
}
```

## Testing

### Unit Tests
```bash
go test ./...
go test -v ./internal/service
go test -cover ./internal/repository
```

### Manual Testing dengan cURL

**Create Room**
```bash
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Kelas A101", "capacity": 40, "type": "classroom"}'
```

**Check Schedule Conflict**
```bash
curl -X POST http://localhost:8080/api/bookings/check-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "date": "2024-02-01",
    "start_time": "10:00",
    "end_time": "11:00"
  }'
```

**Generate Monthly Report**
```bash
curl http://localhost:8080/api/reports/monthly?year=2024&month=1&format=json
```

## Error Handling

Aplikasi menggunakan standard HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `409 Conflict` - Schedule conflict detected
- `500 Internal Server Error` - Server error

## Development Notes

### Best Practices Implemented
1. **Separation of Concerns** - Repository, Service, Handler layers
2. **Error Handling** - Comprehensive error messages
3. **Validation** - Input validation di handler & service layer
4. **Dependency Injection** - Clean dependencies management
5. **Logging** - Structured logging untuk debugging

### Future Improvements
- [ ] Authentication & JWT implementation
- [ ] Request validation middleware
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Email notifications untuk approval
- [ ] Web dashboard UI
- [ ] Docker containerization
- [ ] CI/CD pipeline

## Contributing

Pull requests are welcome! Untuk changes besar, silakan buka issue terlebih dahulu untuk diskusi.

## Author

Galih Mawardi - [@galihmawardi-maker](https://github.com/galihmawardi-maker)

## License

MIT License - see LICENSE file for details

## Support

Untuk pertanyaan atau issue, silakan buka GitHub Issues atau hubungi melalui email.

---

**Last Updated**: 2024
**Status**: Under Development
