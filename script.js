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
    messageBox.classList.remove('hidden'); // Ensure it's visible
}

// Function to close the custom message box
function closeMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = '';
}

const supabaseUrl = 'https://syscmsennlikqzikbznl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5c2Ntc2Vubmxpa3F6aWtiem5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTQ0MDcsImV4cCI6MjA2NTk5MDQwN30.I5cQJNCEFtF1NAIypmgMBYAIiVnSyhu_7C1WhKzCVxE';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Helper to get selected radio value by name
function getRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

// Helper to get selected checkbox values by name
function getCheckboxValues(name) {
    const checkboxes = document.getElementsByName(name);
    const values = [];
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            values.push(checkbox.value);
        }
    }
    return values;
}

function resetForm() {
    const form = document.getElementById('questionnaireForm');
    form.reset();
    // Hide all conditional content
    form.querySelectorAll('.conditional-content').forEach(el => el.classList.add('hidden'));
    // Manually trigger a change event to re-evaluate conditional logic for the reset state
    const event = new Event('change', { bubbles: true });
    form.dispatchEvent(event);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('questionnaireForm');
    if (!form) return;

    document.getElementById('limpiar').addEventListener('click', resetForm);

    form.addEventListener('change', (event) => {
        const input = event.target;

        // Validation for Q10 symptoms
        if (input.name === 'sintomas') {
            const allSintomas = form.querySelectorAll('input[name="sintomas"]');
            const ningunoCheckbox = Array.from(allSintomas).find(cb => cb.value === 'Ninguno');

            if (input.value === 'Ninguno' && input.checked) {
                // If "Ninguno" is checked, uncheck all others
                allSintomas.forEach(cb => {
                    if (cb.value !== 'Ninguno') cb.checked = false;
                });
            } else if (input.checked && input.value !== 'Ninguno') {
                // If another symptom is checked, uncheck "Ninguno"
                if (ningunoCheckbox) ningunoCheckbox.checked = false;
            }
        }

        // Handle single-target show/hide
        if (input.dataset.showIfChecked) {
            const targetIds = input.dataset.showIfChecked.split(',');
            const shouldShow = input.checked;

            targetIds.forEach(id => {
                const targetElement = document.getElementById(id);
                if (targetElement) {
                    targetElement.classList.toggle('hidden', !shouldShow);
                    if (!shouldShow) {
                        // Clear content of hidden elements
                        targetElement.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => i.checked = false);
                        targetElement.querySelectorAll('textarea').forEach(t => t.value = '');
                    }
                }
            });
        }

        // Handle multi-input conditions like Q11, Q15, Q16
        // This needs to check all related inputs, not just the one that changed.
        document.querySelectorAll('[data-show-if-count-gte], [data-show-if-value-in]').forEach(container => {
            const targetId = container.dataset.showTarget;
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;

            let conditionMet = false;
            const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');

            if (container.dataset.showIfCountGte) {
                const requiredCount = parseInt(container.dataset.showIfCountGte, 10);
                const checkedCount = Array.from(inputs).filter(i => i.checked && i.value === 'SI').length;
                conditionMet = checkedCount >= requiredCount;
            } else if (container.dataset.showIfValueIn) {
                const requiredValues = container.dataset.showIfValueIn.split(',');
                const checkedInput = Array.from(inputs).find(i => i.checked);
                if (checkedInput) {
                    conditionMet = requiredValues.includes(checkedInput.value);
                }
            }

            targetElement.classList.toggle('hidden', !conditionMet);
            if (!conditionMet) {
                targetElement.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => i.checked = false);
                targetElement.querySelectorAll('textarea').forEach(t => t.value = '');
            }
        });

        // Special handling for radio groups that show a single element
        const radioName = input.name;
        if (radioName) {
            const radios = form.querySelectorAll(`input[name="${radioName}"]`);
            let anyCheckedShowsSomething = false;
            radios.forEach(radio => {
                if (radio.dataset.showIfChecked && radio.checked) {
                    anyCheckedShowsSomething = true;
                }
            });

            // If no radio in the group is checked that should show something, hide all their potential targets
            if (!anyCheckedShowsSomething) {
                radios.forEach(radio => {
                    if (radio.dataset.showIfChecked) {
                         const targetIds = radio.dataset.showIfChecked.split(',');
                         targetIds.forEach(id => {
                            const targetElement = document.getElementById(id);
                            if (targetElement) targetElement.classList.add('hidden');
                         });
                    }
                });
            }
        }
    });
});


document.getElementById('enviar').addEventListener('click', async (event) => { // Added event parameter
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById('questionnaireForm');
    const formData = {};
    const elements = form.elements;

    for (const element of elements) {
        if (!element.name) continue;

        switch (element.type) {
            case 'text':
            case 'textarea':
            case 'tel':
                formData[element.name] = element.value.trim();
                break;
            case 'radio':
                if (element.checked) {
                    formData[element.name] = element.value;
                }
                break;
            case 'checkbox':
                if (!formData[element.name]) {
                    formData[element.name] = [];
                }
                if (element.checked) {
                    formData[element.name].push(element.value);
                }
                break;
        }
    }

    // Basic validation for required fields
    if (!formData.dni || !formData.nombre || !formData.apellidos) {
        showMessage('Por favor, rellena al menos los campos de DNI, Nombre y Apellidos.', 'error');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('respuestas')
            .insert([{ dni: formData.dni, respuestas_completas: formData }]); // Store all data in one JSONB column

        if (error) {
            showMessage('Error al enviar el cuestionario: ' + error.message, 'error');
        } else {
            showMessage('Cuestionario enviado correctamente. ¡Gracias por su colaboración!');
                    resetForm();
        }
    } catch (e) {
        showMessage('Ha ocurrido un error inesperado al enviar: ' + e.message, 'error');
    }
});
