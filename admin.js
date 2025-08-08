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
const supabaseUrl = 'https://syscmsennlikqzikbznl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5c2Ntc2Vubmxpa3F6aWtiem5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTQ0MDcsImV4cCI6MjA2NTk5MDQwN30.I5cQJNCEFtF1NAIypmgMBYAIiVnSyhu_7C1WhKzCVxE';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- CSV Download Logic ---
document.getElementById('descargarCsv').addEventListener('click', async () => {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.classList.remove('hidden');

    try {
        // Fetch all data from the 'respuestas' table
        const { data, error } = await supabaseClient
            .from('respuestas')
            .select('respuestas_completas'); // Select only the jsonb column

        if (error) {
            showMessage('Error al cargar los datos para el CSV: ' + error.message, 'error');
            return;
        }

        if (!data || data.length === 0) {
            showMessage('No hay datos para exportar.');
            return;
        }

        let allKeys = new Set();
        let flattenedData = [];

        // Flatten each JSON object and collect all unique keys
        data.forEach(row => {
            if (row.respuestas_completas) {
                let flatRow = {};
                for (const key in row.respuestas_completas) {
                    if (Object.hasOwnProperty.call(row.respuestas_completas, key)) {
                        const value = row.respuestas_completas[key];
                        if (Array.isArray(value)) {
                            flatRow[key] = value.join('; '); // Join array elements
                        } else if (value === null) {
                            flatRow[key] = ''; // Represent null as empty string
                        } else {
                            flatRow[key] = String(value).replace(/"/g, '""'); // Escape double quotes
                        }
                        allKeys.add(key);
                    }
                }
                flattenedData.push(flatRow);
            }
        });

        const headers = Array.from(allKeys).sort();
        let csv = headers.map(header => `"${header}"`).join(',') + '\n';

        flattenedData.forEach(row => {
            const rowValues = headers.map(header => {
                const value = row[header] !== undefined ? row[header] : '';
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csv += rowValues.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
