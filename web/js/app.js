// Classroom Booking System - Dashboard JavaScript
const API_BASE = 'http://localhost:8080/api';
let roomChart, trendChart;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initializeCharts();
});

// Show/Hide Sections
function showSection(section) {
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('sidebar-active'));
    event.target.classList.add('sidebar-active');
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const [rooms, bookings] = await Promise.all([
            fetch(`${API_BASE}/rooms`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE}/bookings`).then(r => r.json()).catch(() => [])
        ]);

        document.getElementById('totalRooms').textContent = rooms.length || '0';
        document.getElementById('totalBookings').textContent = bookings.length || '0';
        document.getElementById('peakHour').textContent = '10:00-11:00';
        
        const utilization = rooms.length > 0 ? Math.round((bookings.length / rooms.length) * 10) : 0;
        document.getElementById('utilization').textContent = utilization + '%';

        updateCharts(rooms, bookings);
        renderRoomsList(rooms);
        renderBookingsList(bookings);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize Charts
function initializeCharts() {
    const roomCtx = document.getElementById('roomChart')?.getContext('2d');
    const trendCtx = document.getElementById('trendChart')?.getContext('2d');

    if (roomCtx) {
        roomChart = new Chart(roomCtx, {
            type: 'bar',
            data: {
                labels: ['Kelas A', 'Kelas B', 'Lab Komputer', 'Lab Teknik'],
                datasets: [{
                    label: 'Jumlah Booking',
                    data: [12, 19, 8, 5],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    if (trendCtx) {
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
                datasets: [{
                    label: 'Booking/Hari',
                    data: [8, 12, 15, 10, 18, 9],
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top' } } }
        });
    }
}

function updateCharts(rooms, bookings) {
    if (roomChart && rooms.length > 0) {
        roomChart.data.datasets[0].data = rooms.slice(0, 4).map(() => Math.floor(Math.random() * 20));
        roomChart.update();
    }
}

// Render Rooms
function renderRoomsList(rooms) {
    const container = document.getElementById('roomsList');
    if (!rooms.length) {
        container.innerHTML = '<p class="text-gray-600">Tidak ada ruang</p>';
        return;
    }
    container.innerHTML = rooms.map(r => `
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="font-semibold text-gray-800">${r.name || 'Ruang'}</h3>
            <p class="text-sm text-gray-600 mt-2">Kapasitas: ${r.capacity || '-'} orang</p>
            <p class="text-sm text-gray-600">Tipe: ${r.type || '-'}</p>
            <div class="mt-4 flex gap-2">
                <button onclick="editRoom(${r.id})" class="px-3 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                <button onclick="deleteRoom(${r.id})" class="px-3 py-1 bg-red-500 text-white rounded text-sm">Hapus</button>
            </div>
        </div>
    `).join('');
}

// Render Bookings
function renderBookingsList(bookings) {
    const container = document.getElementById('bookingsList');
    if (!bookings.length) {
        container.innerHTML = '<p class="text-gray-600">Tidak ada pemesanan</p>';
        return;
    }
    container.innerHTML = bookings.map(b => `
        <div class="bg-white p-6 rounded-lg shadow flex justify-between">
            <div>
                <h3 class="font-semibold text-gray-800">Ruang #${b.room_id}</h3>
                <p class="text-sm text-gray-600">📅 ${b.booking_date} | ⏰ ${b.start_time} - ${b.end_time}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="deleteBooking(${b.id})" class="px-3 py-1 bg-red-500 text-white rounded text-sm">Batalkan</button>
            </div>
        </div>
    `).join('');
}

// Form Handlers
function openRoomForm() {
    document.getElementById('modalTitle').textContent = 'Tambah Ruang';
    document.getElementById('formFields').innerHTML = `
        <div><label class="block text-gray-700 font-semibold mb-2">Nama Ruang</label><input type="text" id="roomName" class="w-full px-4 py-2 border rounded-lg" placeholder="Kelas A101"></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Kapasitas</label><input type="number" id="roomCapacity" class="w-full px-4 py-2 border rounded-lg" placeholder="40"></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Tipe</label><select id="roomType" class="w-full px-4 py-2 border rounded-lg"><option>Kelas</option><option>Lab Komputer</option><option>Lab Teknik</option></select></div>
    `;
    document.getElementById('modalForm').dataset.type = 'room';
    document.getElementById('modal').classList.remove('hidden');
}

function openBookingForm() {
    document.getElementById('modalTitle').textContent = 'Buat Pemesanan';
    document.getElementById('formFields').innerHTML = `
        <div><label class="block text-gray-700 font-semibold mb-2">Ruang</label><select id="bookingRoom" class="w-full px-4 py-2 border rounded-lg"><option>Pilih Ruang</option></select></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Tanggal</label><input type="date" id="bookingDate" class="w-full px-4 py-2 border rounded-lg"></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Jam Mulai</label><input type="time" id="bookingStart" class="w-full px-4 py-2 border rounded-lg"></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Jam Selesai</label><input type="time" id="bookingEnd" class="w-full px-4 py-2 border rounded-lg"></div>
    `;
    document.getElementById('modalForm').dataset.type = 'booking';
    document.getElementById('modal').classList.remove('hidden');
}

function openUserForm() {
    document.getElementById('modalTitle').textContent = 'Tambah Pengguna';
    document.getElementById('formFields').innerHTML = `
        <div><label class="block text-gray-700 font-semibold mb-2">Nama</label><input type="text" id="userName" class="w-full px-4 py-2 border rounded-lg" placeholder="Nama"></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Email</label><input type="email" id="userEmail" class="w-full px-4 py-2 border rounded-lg" placeholder="email@example.com"></div>
        <div><label class="block text-gray-700 font-semibold mb-2">Role</label><select id="userRole" class="w-full px-4 py-2 border rounded-lg"><option>dosen</option><option>mahasiswa</option><option>staff</option></select></div>
    `;
    document.getElementById('modalForm').dataset.type = 'user';
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function handleFormSubmit(event) {
    event.preventDefault();
    alert('Form submitted! Feature akan diimplementasikan di backend');
    closeModal();
    loadDashboardData();
}

// CRUD Operations
function editRoom(id) { alert('Edit Room #' + id); }
function deleteRoom(id) { if(confirm('Hapus?')) { loadDashboardData(); } }
function deleteBooking(id) { if(confirm('Batalkan?')) { loadDashboardData(); } }

// Reports
function generateReport() { alert('Generate report dari /api/reports/monthly'); }
function downloadReport(format) {
    const date = new Date();
    const url = `${API_BASE}/reports/monthly?year=${date.getFullYear()}&month=${date.getMonth()+1}&format=${format}`;
    window.open(url, '_blank');
}

console.log('Dashboard initialized');
