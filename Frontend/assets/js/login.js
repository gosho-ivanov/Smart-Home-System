document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const passwordInput = document.getElementById('password');
    
    // Store original button HTML
    const originalButtonContent = submitButton.innerHTML;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Activate loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Authenticating...
        `;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,    // or username: email
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            
            // Store token and redirect
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_id', data.user_id);
            window.location.href = 'mainPage.html';

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please try again.');
            
            // Shake animation for error feedback
            loginForm.classList.add('shake');
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);
            
        } finally {
            // Restore original button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }
});