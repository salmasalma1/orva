let mechanicLocation = null;

// Toggle mechanic location section
document.getElementById("isMechanic").addEventListener("change", function() {
  const locationSection = document.getElementById("mechanic-location-section");
  if (this.checked) {
    locationSection.style.display = "block";
  } else {
    locationSection.style.display = "none";
    mechanicLocation = null;
    document.getElementById("workLocation").value = "";
    document.getElementById("location-status").textContent = "";
  }
});

// Get current location
document.getElementById("getLocationBtn").addEventListener("click", function() {
  const statusEl = document.getElementById("location-status");
  const locationInput = document.getElementById("workLocation");
  const btn = this;
  
  if (!navigator.geolocation) {
    statusEl.textContent = "❌ Geolocation is not supported by your browser";
    statusEl.style.color = "#ff6b6b";
    return;
  }
  
  statusEl.textContent = "📍 Getting your location...";
  statusEl.style.color = "#ffd700";
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      mechanicLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      locationInput.value = `${mechanicLocation.latitude.toFixed(6)}, ${mechanicLocation.longitude.toFixed(6)}`;
      statusEl.textContent = "✓ Location captured successfully!";
      statusEl.style.color = "#2ecc71";
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> Location Captured';
      btn.style.background = "rgba(46, 204, 113, 0.2)";
      btn.style.borderColor = "#2ecc71";
      btn.style.color = "#2ecc71";
    },
    (error) => {
      let errorMsg = "❌ ";
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += "Location permission denied. Please allow location access in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += "Location unavailable. Make sure location services are enabled on your device.";
          break;
        case error.TIMEOUT:
          errorMsg += "Location request timed out. Please try again.";
          break;
        default:
          errorMsg += "Unable to get location. Error: " + error.message;
      }
      statusEl.textContent = errorMsg;
      statusEl.style.color = "#ff6b6b";
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-crosshairs"></i> Get Current Location';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});

// Manual location input
document.getElementById("setManualLocationBtn").addEventListener("click", function() {
  const latValue = document.getElementById("manualLatitude").value.trim();
  const lngValue = document.getElementById("manualLongitude").value.trim();
  const statusEl = document.getElementById("location-status");
  const locationInput = document.getElementById("workLocation");
  const btn = this;
  
  if (!latValue || !lngValue) {
    statusEl.textContent = "❌ Please enter both latitude and longitude";
    statusEl.style.color = "#ff6b6b";
    return;
  }
  
  const lat = parseFloat(latValue);
  const lng = parseFloat(lngValue);
  
  if (isNaN(lat) || isNaN(lng)) {
    statusEl.textContent = "❌ Please enter valid numbers (e.g., 30.0444 and 31.2357)";
    statusEl.style.color = "#ff6b6b";
    return;
  }
  
  if (lat < -90 || lat > 90) {
    statusEl.textContent = "❌ Latitude must be between -90 and 90";
    statusEl.style.color = "#ff6b6b";
    return;
  }
  
  if (lng < -180 || lng > 180) {
    statusEl.textContent = "❌ Longitude must be between -180 and 180";
    statusEl.style.color = "#ff6b6b";
    return;
  }
  
  mechanicLocation = {
    latitude: lat,
    longitude: lng
  };
  
  locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  statusEl.textContent = "✓ Manual location set successfully!";
  statusEl.style.color = "#2ecc71";
  
  btn.innerHTML = '<i class="fas fa-check"></i> Location Set';
  btn.style.background = "rgba(46, 204, 113, 0.2)";
  btn.style.borderColor = "#2ecc71";
  btn.style.color = "#2ecc71";
  
  console.log("Manual location set:", mechanicLocation);
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("password", document.getElementById("password").value);
  formData.append("phone", document.getElementById("phone").value);
  formData.append("nationalId", document.getElementById("N_id").value);
  formData.append("address", document.getElementById("address").value);
  formData.append("age", document.getElementById("age").value);
  formData.append("vehicleType", document.getElementById("vehicleType").value);
  const isMechanic = document.getElementById("isMechanic").checked;
  formData.append("isMechanic", isMechanic);
  
  if (isMechanic) {
    if (!mechanicLocation) {
      const msg = document.getElementById("msg");
      msg.textContent = "✗ Please capture your work location first";
      msg.className = "show error";
      return;
    }
    formData.append("workLocation", JSON.stringify(mechanicLocation));
  }
  
  const photoFile = document.getElementById("photo").files[0];
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  try {
    console.log("Submitting registration...");
    const res = await fetch("/api/users/register", {
      method: "POST",
      body: formData
    });

    console.log("Response status:", res.status);
    
    let data;
    try {
      data = await res.json();
      console.log("Response data:", data);
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      const msg = document.getElementById("msg");
      msg.textContent = "✗ Server returned invalid response";
      msg.className = "show error";
      return;
    }

    if (res.ok) {
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("isMechanic", data.isMechanic);

      const msg = document.getElementById("msg");
      msg.textContent = "✓ Registration successful! Redirecting...";
      msg.className = "show success";

      setTimeout(() => {
        if (data.isMechanic) {
          window.location.href = "../home_mechanic/home_mechanic.html";
        } else {
          window.location.href = "../home_user/home_user.html";
        }
      }, 1000);
    } else {
      console.error("Registration failed:", data);
      const msg = document.getElementById("msg");
      msg.textContent = "✗ " + (data.message || "Registration failed");
      msg.className = "show error";
    }
  } catch (err) {
    console.error("Network error:", err);
    const msg = document.getElementById("msg");
    msg.textContent = "✗ Error connecting to server: " + err.message;
    msg.className = "show error";
  }
});
