// Simple working version for new API
const userToken = localStorage.getItem("userToken");
const userId = localStorage.getItem("userId");

if (!userToken || !userId) {
  alert("Please log in first");
  window.location.href = "/pages/login/login.html";
}

// Load user profile
async function loadProfile() {
  try {
    const res = await fetch("/api/users/profile", {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (res.ok) {
      const user = await res.json();
      document.getElementById("profile-name").value = user.name || "";
      document.getElementById("profile-age").value = user.age || "";
      document.getElementById("profile-email").value = user.email || "";
      document.getElementById("profile-phone").value = user.phone || "";
      document.getElementById("profile-vehicle").value = user.vehicleType || "";
      document.getElementById("profile-address").value = user.address || "";
      
      if (user.photo) {
        document.getElementById("profile-pic").src = user.photo;
      }
      
      console.log("Profile loaded:", user);
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

// Photo upload preview
let selectedPhoto = null;

document.getElementById("profile-photo-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById("profile-pic").src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    if (!isEditing) {
      document.getElementById("save-profile-btn").classList.add("show");
    }
  }
});

// Edit profile functionality
let isEditing = false;

document.getElementById("edit-profile-btn").addEventListener("click", () => {
  isEditing = !isEditing;
  
  const nameInput = document.getElementById("profile-name");
  const ageInput = document.getElementById("profile-age");
  const phoneInput = document.getElementById("profile-phone");
  const vehicleInput = document.getElementById("profile-vehicle");
  const addressInput = document.getElementById("profile-address");
  const saveBtn = document.getElementById("save-profile-btn");
  const editBtn = document.getElementById("edit-profile-btn");
  
  if (isEditing) {
    nameInput.disabled = false;
    ageInput.disabled = false;
    phoneInput.disabled = false;
    vehicleInput.disabled = false;
    addressInput.disabled = false;
    saveBtn.classList.add("show");
    editBtn.innerHTML = '<i class="fas fa-times"></i>';
    editBtn.title = "Cancel";
  } else {
    nameInput.disabled = true;
    ageInput.disabled = true;
    phoneInput.disabled = true;
    vehicleInput.disabled = true;
    addressInput.disabled = true;
    saveBtn.classList.remove("show");
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.title = "Edit Profile";
    loadProfile();
  }
});

// Save profile changes
document.getElementById("save-profile-btn").addEventListener("click", async () => {
  try {
    let res;
    
    if (selectedPhoto) {
      const formData = new FormData();
      formData.append("name", document.getElementById("profile-name").value);
      formData.append("age", document.getElementById("profile-age").value);
      formData.append("phone", document.getElementById("profile-phone").value);
      formData.append("vehicleType", document.getElementById("profile-vehicle").value);
      formData.append("address", document.getElementById("profile-address").value);
      formData.append("photo", selectedPhoto);
      
      res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      });
      
      selectedPhoto = null;
    } else {
      const updates = {
        name: document.getElementById("profile-name").value,
        age: document.getElementById("profile-age").value,
        phone: document.getElementById("profile-phone").value,
        vehicleType: document.getElementById("profile-vehicle").value,
        address: document.getElementById("profile-address").value
      };
      
      res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
    }
    
    if (res.ok) {
      alert("Profile updated successfully!");
      isEditing = false;
      
      document.getElementById("profile-name").disabled = true;
      document.getElementById("profile-age").disabled = true;
      document.getElementById("profile-phone").disabled = true;
      document.getElementById("profile-vehicle").disabled = true;
      document.getElementById("profile-address").disabled = true;
      document.getElementById("save-profile-btn").classList.remove("show");
      document.getElementById("edit-profile-btn").innerHTML = '<i class="fas fa-pencil-alt"></i>';
      document.getElementById("edit-profile-btn").title = "Edit Profile";
      
      loadProfile();
    } else {
      const data = await res.json();
      alert("Failed to update profile: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Error updating profile: " + err.message);
  }
});

// Load mechanics
async function loadMechanics() {
  try {
    const res = await fetch("/api/mechanics");
    
    if (res.ok) {
      const mechanics = await res.json();
      const container = document.getElementById("mechanic-list");
      
      if (mechanics.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tools"></i><p>No mechanics available yet.</p></div>';
      } else {
        container.innerHTML = mechanics.map(m => `
          <div class="card" data-aos="fade-up">
            <div style="display: flex; gap: 20px; align-items: start;">
              <img src="${m.photo || '/images/default-mechanic.png'}" 
                   alt="${m.name}" 
                   style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #ffd700;">
              <div style="flex: 1;">
                <h3><i class="fas fa-user-cog"></i> ${m.name}</h3>
                <p><strong>Description:</strong> ${m.description || 'Professional mechanic ready to help!'}</p>
                <p><strong>Specialties:</strong> ${m.specialties ? m.specialties.join(', ') : 'General Repair'}</p>
                <p><i class="fas fa-phone"></i> ${m.phone}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${m.address}</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                  <button class="request-btn" onclick="openChat('${m._id}', '${m.name}')">
                    <i class="fas fa-comments"></i> Chat Now
                  </button>
                  <button class="request-add-btn" onclick="requestToAdd('${m._id}', '${m.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-plus-circle"></i> Request to Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join("");
      }
      
      console.log("Loaded mechanics:", mechanics);
    }
  } catch (err) {
    console.error("Failed to load mechanics:", err);
    document.getElementById("mechanic-list").innerHTML = '<p>Error loading mechanics</p>';
  }
}

// Request to Add - Navigate to request page
window.requestToAdd = function(mechanicId, mechanicName) {
  window.location.href = `/pages/request/request.html?mechanicId=${mechanicId}&mechanicName=${encodeURIComponent(mechanicName)}`;
};

// Tab navigation
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.getElementById(btn.dataset.tab + "-tab").style.display = "block";
    
    if (btn.dataset.tab === "home") loadMechanics();
    if (btn.dataset.tab === "profile") loadProfile();
  });
});

// Chat functionality
let currentChatId = null;
let currentMechanicId = null;
let currentMechanicName = '';
let chatInterval = null;

// Open chat with mechanic
window.openChat = async function(mechanicId, mechanicName) {
  currentMechanicId = mechanicId;
  currentMechanicName = mechanicName;
  
  document.getElementById('chat-mechanic-name').textContent = mechanicName;
  document.getElementById('chat-modal').style.display = 'flex';
  document.getElementById('chat-messages').innerHTML = '<div class="chat-loading">Loading chat...</div>';
  
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mechanicId })
    });
    
    if (res.ok) {
      const chat = await res.json();
      currentChatId = chat._id;
      await loadMessages();
      startChatPolling();
    } else {
      document.getElementById('chat-messages').innerHTML = '<div class="chat-loading">Failed to load chat</div>';
    }
  } catch (err) {
    console.error('Error opening chat:', err);
    document.getElementById('chat-messages').innerHTML = '<div class="chat-loading">Error loading chat</div>';
  }
};

// Load messages
async function loadMessages() {
  if (!currentChatId) return;
  
  try {
    const res = await fetch(`/api/chats/${currentChatId}/messages`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (res.ok) {
      const messages = await res.json();
      displayMessages(messages);
      
      await fetch(`/api/chats/${currentChatId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
    }
  } catch (err) {
    console.error('Error loading messages:', err);
  }
}

// Display messages
function displayMessages(messages) {
  const container = document.getElementById('chat-messages');
  
  if (messages.length === 0) {
    container.innerHTML = '<div class="chat-loading">No messages yet. Start the conversation!</div>';
    return;
  }
  
  container.innerHTML = messages.map(msg => {
    const isSent = msg.senderId === userId;
    const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const initial = isSent ? 'You' : currentMechanicName.charAt(0);
    
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        <div class="message-avatar">${initial}</div>
        <div>
          <div class="message-content">${escapeHtml(msg.text)}</div>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;
  }).join('');
  
  container.scrollTop = container.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Send message
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  
  if (!text || !currentChatId) return;
  
  try {
    const res = await fetch(`/api/chats/${currentChatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (res.ok) {
      input.value = '';
      input.style.height = 'auto';
      await loadMessages();
    } else {
      alert('Failed to send message');
    }
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Error sending message');
  }
}

// Start polling for new messages
function startChatPolling() {
  if (chatInterval) clearInterval(chatInterval);
  chatInterval = setInterval(() => {
    if (currentChatId) loadMessages();
  }, 3000);
}

// Stop polling
function stopChatPolling() {
  if (chatInterval) {
    clearInterval(chatInterval);
    chatInterval = null;
  }
}

// Close chat
document.getElementById('chat-close').addEventListener('click', () => {
  document.getElementById('chat-modal').style.display = 'none';
  stopChatPolling();
  currentChatId = null;
  currentMechanicId = null;
});

// Send button
document.getElementById('chat-send-btn').addEventListener('click', sendMessage);

// Enter to send (Shift+Enter for new line)
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
document.getElementById('chat-input').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Close chat modal when clicking outside
document.getElementById('chat-modal').addEventListener('click', (e) => {
  if (e.target.id === 'chat-modal') {
    document.getElementById('chat-modal').style.display = 'none';
    stopChatPolling();
    currentChatId = null;
    currentMechanicId = null;
  }
});

// Initial load
loadMechanics();
loadProfile();
