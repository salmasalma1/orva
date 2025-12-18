const userToken = localStorage.getItem("userToken");
const userId = localStorage.getItem("userId");
const isAdmin = localStorage.getItem("isAdmin");

if (!userToken || !userId || (isAdmin !== 'true' && isAdmin !== true)) {
  alert("Access denied. Admin only.");
  window.location.href = "/pages/login/login.html";
}

let deleteTarget = null;

// ----------- Load All Users -----------
async function loadUsers() {
  try {
    const res = await fetch("http://localhost:5000/api/users", {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (res.ok) {
      const allUsers = await res.json();
      const users = allUsers.filter(u => !u.isMechanic && !u.isAdmin);
      const container = document.getElementById("users-list");
      
      if (users.length === 0) {
        container.innerHTML = '<p>No users found.</p>';
      } else {
        container.innerHTML = users.map(u => `
          <div class="card">
            <strong>${u.name}</strong><br>
            <small>Email: ${u.email}</small><br>
            <small>Phone: ${u.phone}</small><br>
            <small>National ID: ${u.nationalId}</small><br>
            <small>Vehicle: ${u.vehicleType || 'N/A'}</small><br>
            <small>Joined: ${new Date(u.createdAt).toLocaleDateString()}</small><br>
            <button class="btn-block" onclick="confirmDelete('${u._id}', '${u.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', 'user')">Delete User</button>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error("Failed to load users:", err);
    document.getElementById("users-list").innerHTML = '<p>Error loading users</p>';
  }
}


// ----------- Load All Mechanics -----------
async function loadMechanics() {
  try {
    const res = await fetch("http://localhost:5000/api/mechanics");
    
    if (res.ok) {
      const mechanics = await res.json();
      const container = document.getElementById("mechanics-list");
      
      if (mechanics.length === 0) {
        container.innerHTML = '<p>No mechanics found.</p>';
      } else {
        container.innerHTML = mechanics.map(m => `
          <div class="card">
            <strong>${m.name}</strong><br>
            <small>Email: ${m.email}</small><br>
            <small>Phone: ${m.phone}</small><br>
            <small>Address: ${m.address}</small><br>
            ${m.workLocation ? `<small><strong>📍 Work Location:</strong> ${m.workLocation.latitude.toFixed(6)}, ${m.workLocation.longitude.toFixed(6)}</small><br>` : ''}
            <small>Specialties: ${m.specialties ? m.specialties.join(', ') : 'N/A'}</small><br>
            <small>Joined: ${new Date(m.createdAt).toLocaleDateString()}</small><br>
            <button class="btn-block" onclick="confirmDelete('${m._id}', '${m.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', 'mechanic')">Delete Mechanic</button>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error("Failed to load mechanics:", err);
    document.getElementById("mechanics-list").innerHTML = '<p>Error loading mechanics</p>';
  }
}


// ----------- Load All Requests -----------
async function loadRequests() {
  try {
    const res = await fetch("http://localhost:5000/api/requests", {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (res.ok) {
      const requests = await res.json();
      const container = document.getElementById("requests-list");
      
      if (requests.length === 0) {
        container.innerHTML = '<p>No requests found.</p>';
      } else {
        container.innerHTML = requests.map(r => {
          let mechanicLocation = '';
          if (r.mechanic && r.mechanic.workLocation) {
            mechanicLocation = `<small><strong>📍 Mechanic Location:</strong> ${r.mechanic.workLocation.latitude.toFixed(6)}, ${r.mechanic.workLocation.longitude.toFixed(6)}</small><br>`;
          }
          
          return `
            <div class="card">
              <strong>Request #${r._id.substring(0, 8)}</strong><br>
              ${mechanicLocation}
              <small>User: ${r.user ? r.user.name : 'N/A'}</small><br>
              <small>Mechanic: ${r.mechanic ? r.mechanic.name : 'N/A'}</small><br>
              <small>Service: ${r.serviceType}</small><br>
              <small>Vehicle: ${r.vehicleType}</small><br>
              <small>Status: <span style="color: ${r.status === 'completed' ? '#28a745' : r.status === 'pending' ? '#ffc107' : '#dc3545'};">${r.status}</span></small><br>
              <small>Date: ${new Date(r.createdAt).toLocaleString()}</small><br>
            </div>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error("Failed to load requests:", err);
    document.getElementById("requests-list").innerHTML = '<p>Error loading requests</p>';
  }
}

// ----------- Delete Confirmation -----------
window.confirmDelete = function(id, name, type) {
  deleteTarget = { id, name, type };
  document.getElementById('delete-type').textContent = type;
  document.getElementById('delete-name').textContent = name;
  document.getElementById('delete-modal').style.display = 'flex';
};

document.getElementById('delete-cancel').addEventListener('click', () => {
  document.getElementById('delete-modal').style.display = 'none';
  deleteTarget = null;
});

document.getElementById('delete-confirm').addEventListener('click', async () => {
  if (!deleteTarget) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/users/${deleteTarget.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (res.ok) {
      alert(`${deleteTarget.type} deleted successfully`);
      document.getElementById('delete-modal').style.display = 'none';
      deleteTarget = null;
      
      loadUsers();
      loadMechanics();
    } else {
      alert('Failed to delete. Please try again.');
    }
  } catch (err) {
    console.error('Error deleting:', err);
    alert('Error deleting. Please try again.');
  }
});


// ----------- Navigation Tabs -----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.id === 'logout-btn') {
      localStorage.clear();
      window.location.href = "/pages/login/login.html";
      return;
    }
    
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll(".tab").forEach(t => (t.style.display = "none"));
    document.getElementById(btn.dataset.tab + "-tab").style.display = "block";

    if (btn.dataset.tab === "users") loadUsers();
    if (btn.dataset.tab === "mechanics") loadMechanics();
    if (btn.dataset.tab === "requests") loadRequests();
  });
});

// load first tab
loadUsers();
