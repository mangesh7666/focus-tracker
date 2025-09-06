document.addEventListener('DOMContentLoaded', function() {
    // Get references to all necessary UI elements.
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginStatus = document.getElementById('loginStatus');
    const loginView = document.getElementById('loginView');
    const loggedInView = document.getElementById('loggedInView');

    // This function checks for a token and updates the UI accordingly.
    function checkLoginStatus() {
        chrome.storage.local.get(['authToken'], function(result) {
            if (result.authToken) {
                // If a token exists, the user is logged in.
                loginView.style.display = 'none';
                loggedInView.style.display = 'block';
            } else {
                // If no token exists, the user is not logged in.
                loginView.style.display = 'block';
                loggedInView.style.display = 'none';
            }
        });
    }

    // Call this function when the popup first loads to set the correct view.
    checkLoginStatus();

    // Event listener for the login form submission.
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            loginStatus.textContent = 'Logging in...';

            try {
                const API_URL = "http://localhost:5000";
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.token;
                    chrome.storage.local.set({ authToken: token }, function() {
                        loginStatus.textContent = 'Login successful!';
                        console.log('Login successful, token stored.');
                        // After a successful login, update the UI.
                        checkLoginStatus();
                        chrome.runtime.sendMessage({ action: 'loginSuccessful' });
                    });
                } else {
                    const errorData = await response.json();
                    loginStatus.textContent = `Login failed: ${errorData.message}`;
                    console.error('Login failed:', errorData.message);
                }
            } catch (error) {
                console.error('Error during login:', error);
                loginStatus.textContent = 'Failed to connect to server. Please check your backend is running.';
            }
        });
    }
    
    // Event listener for the logout button.
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Remove the token from local storage.
            chrome.storage.local.remove('authToken', function() {
                console.log('Authentication token removed.');
                // Update the UI to show the login form again.
                checkLoginStatus();
            });
        });
    }
});



/*document.getElementById('openCamera').addEventListener('click', () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("camera.html"),
        type: "popup",
        width: 400,
        height: 350,
        focused: true
    });
});*/
