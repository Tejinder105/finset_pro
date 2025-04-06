document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');

    if (password !== confirmPassword) {
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Passwords do not match';
        return;
    }

    if (password.length < 8) {
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Password must be at least 8 characters long';
        return;
    }

    try {
        const response = await fetch('/reset-password', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                newPassword: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            errorMessage.style.color = 'green';
            errorMessage.textContent = 'Password successfully reset. Redirecting to login...';
            setTimeout(() => {
                window.location.href = '/signin';
            }, 2000);
        } else {
            errorMessage.style.color = 'red';
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});
