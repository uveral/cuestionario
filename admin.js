// Function to display custom messages
function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close-button" onclick="closeMessage()">&times;</button>
                <p class="${type === 'error' ? 'text-red-600' : 'text-gray-800'} text-lg font-medium">${message}</p>
            </div>
        </div>
    `;
    messageBox.classList.remove('hidden');
}

// Function to close the custom message box
function closeMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = '';
}

// --- Supabase Client Setup ---
// IMPORTANT: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://slnbgfkkwjlxcsyrovam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbmJnZmtrd2pseGNzeXJvdmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTg4OTMsImV4cCI6MjA2Njg3NDg5M30.c1mwy72SE0_xYdVwPmLccbwKwnPR7nLUaaX-0oaFY14';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Auth & Page Protection ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
    }

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    });
});

// --- CSV Download Logic ---
document.getElementById('descargarCsv').addEventListener('click', async () => {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.classList.remove('hidden');

    try {
        const { data, error } = await supabaseClient.functions.invoke('download-csv');

        if (error) {
            throw error;
        }

        // The function returns the CSV data as a blob.
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'cuestionario_respuestas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showMessage('Datos descargados como CSV correctamente.');

    } catch (e) {
        showMessage('Ha ocurrido un error inesperado al descargar el CSV: ' + e.message, 'error');
    } finally {
        loadingMessage.classList.add('hidden');
    }
});
