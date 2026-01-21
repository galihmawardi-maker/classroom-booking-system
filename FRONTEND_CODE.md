# Frontend Code Guide

## web/style.css

Create this file with professional styling:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.navbar { background: #2c3e50; color: white; padding: 15px 0; margin-bottom: 30px; }
.navbar h1 { margin-left: 20px; }
.tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #ddd; }
.tab-button { padding: 10px 20px; background: #ecf0f1; border: none; cursor: pointer; border-radius: 5px 5px 0 0; }
.tab-button.active { background: #3498db; color: white; }
.tab-content { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; }
input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
button { padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:hover { background: #229954; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
table th, table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
table th { background: #3498db; color: white; }
.alert { padding: 10px; margin-bottom: 10px; border-radius: 4px; }
.alert.success { background: #d4edda; color: #155724; }
.alert.error { background: #f8d7da; color: #721c24; }
.alert.info { background: #d1ecf1; color: #0c5460; }
```

## web/js/app.js - Enhanced Version

Replace the existing app.js with this complete version:

```javascript
const API_BASE = 'http://localhost:8080/api';
let currentRole = 'dosen';
let currentUserId = 1; // Default user
let rooms = [];
let bookings = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupTabListeners();
    loadRooms();
    loadBookings();
});

function setupTabListeners() {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-content').style.display = 'block';
        });
    });
    // Activate first tab
    if (buttons.length > 0) buttons[0].click();
}

// Rooms Management
function loadRooms() {
    fetch(`${API_BASE}/rooms`)
        .then(r => r.json())
        .then(data => {
            rooms = data || [];
            displayRooms();
        })
        .catch(err => console.error('Error loading rooms:', err));
}

function displayRooms() {
    const roomsList = document.getElementById('rooms-list');
    if (!roomsList) return;
    
    roomsList.innerHTML = '<table><tr><th>Nama Ruang</th><th>Tipe</th><th>Kapasitas</th><th>Status</th></tr>';
    rooms.forEach(room => {
        roomsList.innerHTML += `<tr>
            <td>${room.name}</td>
            <td>${room.type}</td>
            <td>${room.capacity}</td>
            <td>${room.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
        </tr>`;
    });
    roomsList.innerHTML += '</table>';
}

function createRoom() {
    const name = document.getElementById('room-name')?.value;
    const type = document.getElementById('room-type')?.value;
    const capacity = document.getElementById('room-capacity')?.value;
    
    if (!name || !type || !capacity) {
        showAlert('Semua field harus diisi', 'error');
        return;
    }
    
    fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, type, capacity: parseInt(capacity) })
    })
    .then(r => r.json())
    .then(data => {
        showAlert('Ruang berhasil dibuat', 'success');
        loadRooms();
        document.getElementById('room-form')?.reset();
    })
    .catch(err => showAlert('Error: ' + err, 'error'));
}

// Bookings Management
function loadBookings() {
    fetch(`${API_BASE}/bookings`)
        .then(r => r.json())
        .then(data => {
            bookings = data || [];
            displayBookings();
        })
        .catch(err => console.error('Error loading bookings:', err));
}

function displayBookings() {
    const list = document.getElementById('bookings-list');
    if (!list) return;
    
    list.innerHTML = '<table><tr><th>Ruang</th><th>Tanggal</th><th>Jam Mulai</th><th>Jam Selesai</th><th>Status</th><th>Aksi</th></tr>';
    bookings.forEach(booking => {
        const roomName = rooms.find(r => r.id === booking.room_id)?.name || 'N/A';
        list.innerHTML += `<tr>
            <td>${roomName}</td>
            <td>${booking.date}</td>
            <td>${booking.start_time}</td>
            <td>${booking.end_time}</td>
            <td>${booking.status}</td>
            <td>${currentRole === 'admin' && booking.status === 'pending' ? 
                `<button onclick="approveBooking(${booking.id})">Setujui</button>
                <button onclick="rejectBooking(${booking.id})">Tolak</button>` : '-'}</td>
        </tr>`;
    });
    list.innerHTML += '</table>';
}

function createBooking() {
    const roomId = document.getElementById('booking-room')?.value;
    const date = document.getElementById('booking-date')?.value;
    const startTime = document.getElementById('booking-start')?.value;
    const endTime = document.getElementById('booking-end')?.value;
    const purpose = document.getElementById('booking-purpose')?.value;
    
    if (!roomId || !date || !startTime || !endTime) {
        showAlert('Semua field harus diisi', 'error');
        return;
    }
    
    fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            room_id: parseInt(roomId),
            user_id: currentUserId,
            date,
            start_time: startTime,
            end_time: endTime,
            purpose
        })
    })
    .then(r => r.json())
    .then(data => {
        showAlert('Pemesanan berhasil dibuat (pending)', 'success');
        loadBookings();
        document.getElementById('booking-form')?.reset();
    })
    .catch(err => showAlert('Error: ' + err, 'error'));
}

function approveBooking(id) {
    fetch(`${API_BASE}/bookings/${id}/approve`, {method: 'POST'})
        .then(() => {
            showAlert('Pemesanan disetujui', 'success');
            loadBookings();
        })
        .catch(err => showAlert('Error: ' + err, 'error'));
}

function rejectBooking(id) {
    fetch(`${API_BASE}/bookings/${id}/reject`, {method: 'POST'})
        .then(() => {
            showAlert('Pemesanan ditolak', 'success');
            loadBookings();
        })
        .catch(err => showAlert('Error: ' + err, 'error'));
}

function generateReport() {
    const month = document.getElementById('report-month')?.value;
    const year = document.getElementById('report-year')?.value;
    
    if (!month || !year) {
        showAlert('Pilih bulan dan tahun', 'error');
        return;
    }
    
    // Filter bookings by month/year
    const filtered = bookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate.getMonth() + 1 == month && bDate.getFullYear() == year;
    });
    
    const json = JSON.stringify({month, year, bookings: filtered}, null, 2);
    download(`laporan_${year}${String(month).padStart(2, '0')}.json`, json);
    showAlert('Laporan JSON diunduh', 'success');
}

function download(filename, content) {
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    el.setAttribute('download', filename);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

function showAlert(msg, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = msg;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 5000);
}
```

## Update web/index.html

Add all necessary tabs and form elements. See existing HTML for structure.

## Testing

- Create rooms
- Make bookings
- Approve/reject bookings
- Generate reports
