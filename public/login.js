// ===== LOGIN SCRIPT =====
document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", handleLogin);

    // Allow Enter key login
    document.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            handleLogin();
        }
    });

    function handleLogin() {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMsg = document.getElementById("errorMsg");

        errorMsg.textContent = "";

        if (!username || !password) {
            errorMsg.textContent = "Please enter username and password";
            return;
        }

        // Demo credentials
        if (username === "admin" && password === "admin123") {

            // Save login status
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);

            // Redirect to dashboard
            if (localStorage.getItem("isLoggedIn") === "true") {
                window.location.replace("dashboard.html");
            }

        } else {
            errorMsg.textContent = "Invalid username or password";
        }
    }

});
