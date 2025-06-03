document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('form');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.querySelector('input[type="password"][placeholder="Enter your password again"]');
    
    // Store original button HTML
    const originalButtonContent = submitButton.innerHTML;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate inputs
        if (!username || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match!');
            confirmPasswordInput.focus();
            return;
        }

        // Password strength check (minimum 8 chars)
        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            passwordInput.focus();
            return;
        }

        // Activate loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Creating account...
        `;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            // Success - redirect to login
            showSuccess('Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            showError(error.message || 'Registration failed. Please try again.');
        } finally {
            // Restore original button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    });

    // Password strength indicator
    passwordInput.addEventListener('input', updatePasswordStrength);

    // Helper functions
    function updatePasswordStrength() {
        const password = passwordInput.value;
        const strengthText = document.getElementById('password-strength');
        
        if (!strengthText) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        const strengthMessages = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
        strengthText.textContent = strengthMessages[strength];
        strengthText.className = 'strength-' + strength;
    }

    function showError(message) {
        const errorElement = document.getElementById('error-message') || createMessageElement('error');
        errorElement.textContent = message;
        registerForm.classList.add('shake');
        setTimeout(() => registerForm.classList.remove('shake'), 500);
    }

    function showSuccess(message) {
        const successElement = document.getElementById('success-message') || createMessageElement('success');
        successElement.textContent = message;
    }

    function createMessageElement(type) {
        const element = document.createElement('div');
        element.id = `${type}-message`;
        element.className = `alert alert-${type} mt-3`;
        registerForm.appendChild(element);
        return element;
    }
});