# Setup & Jalankan Project di VS Code

## Persyaratan Awal

Sebelum menjalankan project, pastikan sudah install:

1. **Go 1.21+** - [Download di golang.org](https://golang.org/dl/)
   ```bash
   # Cek versi Go
   go version
   ```

2. **MySQL 5.7+** - [Download di mysql.com](https://dev.mysql.com/downloads/mysql/)
   ```bash
   # Cek versi MySQL
   mysql --version
   ```

3. **Git** - [Download di git-scm.com](https://git-scm.com/)
   ```bash
   git --version
   ```

4. **VS Code** - [Download di code.visualstudio.com](https://code.visualstudio.com/)

---

## Langkah 1: Clone Repository

```bash
# Buka terminal/command prompt
cd Desktop  # atau folder pilihan Anda

# Clone repository
git clone https://github.com/galihmawardi-maker/classroom-booking-system.git

# Masuk ke folder project
cd classroom-booking-system
```

---

## Langkah 2: Setup Database MySQL

### 2.1 Buka MySQL Command Line atau MySQL Workbench

```bash
# Atau gunakan GUI MySQL Workbench
mysql -u root -p
```

### 2.2 Buat Database

```sql
CREATE DATABASE classroom_booking_db;
USE classroom_booking_db;

-- Tabel Ruang (Kelas & Lab)
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    type ENUM('kelas', 'lab') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pemesanan
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Tabel Pengguna (optional untuk authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'staff') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Langkah 3: Setup Environment Variables

### 3.1 Rename `.env.example` ke `.env`

Copy `.env.example` dan rename menjadi `.env`

### 3.2 Edit file `.env`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password  # Ganti dengan password MySQL Anda
DB_NAME=classroom_booking_db

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=localhost

# Environment
ENVIRONMENT=development
```

---

## Langkah 4: Buka Project di VS Code

```bash
# Buka VS Code dengan folder project
code .
```

Atau:
1. Buka VS Code
2. File → Open Folder
3. Pilih folder `classroom-booking-system`
4. Click "Select Folder"

---

## Langkah 5: Install Go Extensions (Opsional tapi Recommended)

Di VS Code:
1. Buka Extensions (Ctrl+Shift+X)
2. Cari "Go"
3. Install extension "Go" by Go Team at Google
4. Install extension "REST Client" untuk testing API

---

## Langkah 6: Download Dependencies

Buka terminal di VS Code (Ctrl+`) dan jalankan:

```bash
# Download semua dependencies
go mod download

# atau
go mod tidy
```

---

## Langkah 7: Run Application

Di terminal VS Code, jalankan:

```bash
# Cara 1: Langsung jalankan
go run cmd/main/main.go

# Cara 2: Build dulu, terus jalankan
go build -o classroom-booking cmd/main/main.go
./classroom-booking  # Windows: classroom-booking.exe
```

**Output yang diharapkan:**
```
[GIN-debug] Loaded HTML rendering engine
[GIN-debug] Listening and serving HTTP on :8080
```

---

## Langkah 8: Buka Dashboard

Saat aplikasi sudah running, buka di browser:

```
http://localhost:8080
```

Voila! Dashboard sudah muncul dengan:
- Sidebar navigation
- Statistics cards
- Interactive charts
- Booking calendar
- CRUD operations untuk rooms & bookings

---

## Troubleshooting

### Error: "go: command not found"
- Go belum terinstall atau tidak ada di PATH
- Reinstall Go dari [golang.org](https://golang.org/dl/)

### Error: "failed to open database"
- MySQL tidak running → Buka MySQL Service
- Username/password di `.env` salah
- Database belum dibuat

### Error: "port 8080 already in use"
- Ada aplikasi lain yang pakai port 8080
- Ubah `SERVER_PORT` di `.env` ke port lain (misal: 3000, 5000)

### Frontend tidak muncul
- Pastikan folder `web/` ada
- Pastikan path di Go code mengarah ke `web/index.html` dengan benar

---

## Testing API dengan REST Client

### Install REST Client Extension
1. Di VS Code: Ctrl+Shift+X
2. Cari "REST Client"
3. Install by Huachao Mao

### Buat file `test.http`

```http
### Get All Rooms
GET http://localhost:8080/api/rooms

### Create Room
POST http://localhost:8080/api/rooms
Content-Type: application/json

{
  "name": "Kelas 101",
  "capacity": 40,
  "type": "kelas"
}

### Get All Bookings
GET http://localhost:8080/api/bookings

### Create Booking
POST http://localhost:8080/api/bookings
Content-Type: application/json

{
  "room_id": 1,
  "user_name": "Galih",
  "start_time": "2025-01-25 10:00:00",
  "end_time": "2025-01-25 12:00:00",
  "purpose": "Lecture"
}
```

Click "Send Request" di atas setiap request untuk test.

---

## Debugging di VS Code

### Setup Debugger

1. Buat folder `.vscode` di root project (auto-created biasanya)
2. Edit atau buat file `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Connect to Server",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}/cmd/main/main.go",
      "cwd": "${workspaceFolder}",
      "args": []
    }
  ]
}
```

3. Tekan F5 untuk start debugging
4. Set breakpoints dengan click di samping line number

---

## Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/galihmawardi-maker/classroom-booking-system.git
cd classroom-booking-system

# 2. Setup MySQL (di MySQL CLI)
# Jalankan SQL commands dari Langkah 2

# 3. Rename env
cp .env.example .env
# Edit .env dengan database credentials Anda

# 4. Open VS Code
code .

# 5. Di VS Code terminal: Install dependencies
go mod download

# 6. Run application
go run cmd/main/main.go

# 7. Buka di browser
# http://localhost:8080
```

---

## Struktur Project

```
classroom-booking-system/
├── cmd/
│   └── main/
│       └── main.go           # Entry point aplikasi
├── web/
│   ├── index.html            # Admin dashboard
│   └── js/
│       └── app.js            # JavaScript logic
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore rules
├── go.mod                    # Go module file
└── README.md                 # Project documentation
```

---

## Next Steps

1. **Develop lebih lanjut** - Tambah features sesuai kebutuhan UAS
2. **Add more endpoints** - Sesuaikan dengan requirement di README.md
3. **Testing** - Test semua API endpoints
4. **Deployment** - Deploy ke server (heroku, railway, vps, dll)

---

**Sukses! Selamat mengerjakan UAS Pemrograman Dasar 2! 🚀**
