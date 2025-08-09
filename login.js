// --- Supabase Client Setup ---
const supabaseUrl = 'https://slnbgfkkwjlxcsyrovam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbmJnZmtrd2pseGNzeXJvdmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTg4OTMsImV4cCI6MjA2Njg3NDg5M30.c1mwy72SE0_xYdVwPmLccbwKwnPR7nLUaaX-0oaFY14';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Message Functions ---
function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    const messageTypeClass = type === 'error' ? 'text-red-600' : 'text-gray-800';
    messageBox.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close-button" onclick="closeMessage()">&times;</button>
                <p class="${messageTypeClass} text-lg font-medium">${message}</p>
            </div>
        </div>
    `;
    messageBox.classList.remove('hidden');
}

function closeMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = '';
}

// --- Login Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            showMessage('Error al iniciar sesión: ' + error.message, 'error');
        } else {
            // On successful login, redirect to the admin page
            window.location.href = 'admin.html';
        }
    });
});
