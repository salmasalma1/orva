let selectedMechanic = null;

function goBack() {
  window.location.href = "/pages/home_user/home_user.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mechanicId = urlParams.get('mechanicId');
  const mechanicName = urlParams.get('mechanicName');

  if (!mechanicId || !mechanicName) {
    alert("Invalid request. Redirecting to home...");
    window.location.href = "/pages/home_user/home_user.html";
    return;
  }

  selectedMechanic = { id: mechanicId, name: mechanicName };

  await loadMechanicDetails(mechanicId, mechanicName);

  document.getElementById("request-form").addEventListener("submit", handleSubmit);
});

async function loadMechanicDetails(mechanicId, mechanicName) {
  document.getElementById("mechanic-name").textContent = mechanicName;

  try {
    const res = await fetch("/api/mechanics/" + mechanicId);
    if (res.ok) {
      const mechanic = await res.json();
      
      if (mechanic) {
        document.getElementById("mechanic-email").textContent = mechanic.email || "N/A";
        document.getElementById("mechanic-phone").textContent = mechanic.phone || "N/A";
        document.getElementById("mechanic-address").textContent = mechanic.address || "N/A";
      }
    }
  } catch (err) {
    console.error("Failed to load mechanic details:", err);
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const description = document.getElementById("issue-description").value.trim();
  const payment = document.getElementById("payment-amount").value.trim();

  if (!description || !payment || payment < 100) {
    alert("Please describe the issue and offer a valid payment amount (min 100 EGP).");
    return;
  }

  const userToken = localStorage.getItem("userToken");
  
  try {
    const userRes = await fetch("/api/users/profile", {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (!userRes.ok) {
      alert("Failed to load user profile. Please log in again.");
      window.location.href = "/pages/login/login.html";
      return;
    }

    const user = await userRes.json();

    const payload = {
      mechanic: selectedMechanic.id,
      serviceType: "General Repair",
      vehicleType: user.vehicleType || "Not specified",
      description: description,
      location: {
        type: "Point",
        coordinates: [0, 0]
      }
    };

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      document.getElementById("request-form").style.display = "none";
      document.getElementById("success-message").classList.add("show");
      
      setTimeout(() => {
        window.location.href = "/pages/home_user/home_user.html#pending";
      }, 2500);
    } else {
      const errorData = await res.json();
      console.error("Request failed:", errorData);
      alert("Failed to send request: " + (errorData.message || "Please try again."));
    }
  } catch (err) {
    console.error("Error sending request:", err);
    alert("Network error. Please check your connection and try again.");
  }
}
