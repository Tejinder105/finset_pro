function logout() {
    // Clear the authentication token
    localStorage.removeItem('token');
    
    // Redirect to signin page
    window.location.href = '/signin';
}

// Add event listener when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('.logout-link');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});