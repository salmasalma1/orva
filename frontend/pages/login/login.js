document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    console.log("Attempting login to:", "http://localhost:5000/api/users/login");
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", res.headers.get("content-type"));
    
    const responseText = await res.text();
    console.log("Raw response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response was:", responseText);
      throw new Error("Server returned invalid response. Are you accessing from http://localhost:5000?");
    }

    if (res.ok) {
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("isMechanic", data.isMechanic);
      localStorage.setItem("isAdmin", data.isAdmin);

      const msg = document.getElementById("msg");
      msg.textContent = "✓ Login successful! Redirecting...";
      msg.className = "show success";

      setTimeout(() => {
        if (data.isAdmin) {
          window.location.href = "../home_admin/home_admin.html";
        } else if (data.isMechanic) {
          window.location.href = "../home_mechanic/home_mechanic.html";
        } else {
          window.location.href = "../home_user/home_user.html";
        }
      }, 1000);
    } else {
      console.error("Login failed:", data);
      const msg = document.getElementById("msg");
      msg.textContent = "✗ " + (data.message || "Login failed");
      msg.className = "show error";
    }
  } catch (err) {
    console.error("Network error:", err);
    const msg = document.getElementById("msg");
    msg.textContent = "✗ Error connecting to server: " + err.message;
    msg.className = "show error";
  }
});