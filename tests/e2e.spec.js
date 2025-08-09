const { test, expect } = require('@playwright/test');

test.describe('Cuestionario Psicológico', () => {
  const BASE_URL = 'http://localhost:3000'; // Assuming a local server is running for testing

  test('should allow a user to fill and submit the form', async ({ page }) => {
    // Navigate to the form
    await page.goto(`${BASE_URL}/index.html`);

    // Fill out required fields
    await page.fill('input[name="nombre"]', 'Juan');
    await page.fill('input[name="apellidos"]', 'Pérez');
    await page.fill('input[name="dni"]', '12345678Z'); // A valid DNI for testing

    // Select some options
    await page.check('input[name="saludGeneral"][value="Bueno"]');
    await page.check('input[name="hospitalizado"][value="No"]');

    // Click the submit button
    await page.click('button#enviar');

    // Wait for the success message to appear
    const successMessage = page.locator('.modal-content p');
    await expect(successMessage).toContainText('Cuestionario enviado correctamente');
  });

  test('should show DNI validation error for invalid DNI', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // Fill with an invalid DNI
    await page.fill('input[name="dni"]', '12345678A');

    // Check for the validation message
    const validationMessage = page.locator('#dni-validation-message');
    await expect(validationMessage).toHaveText('Formato de DNI incorrecto');
    await expect(page.locator('input[name="dni"]')).toHaveClass(/input-error/);
  });

  test('should clear the form when "Limpiar Formulario" is clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // Fill a field
    const nombreInput = page.locator('input[name="nombre"]');
    await nombreInput.fill('Test');
    await expect(nombreInput).toHaveValue('Test');

    // Click the clear button
    await page.click('button#limpiar');

    // Assert the field is now empty
    await expect(nombreInput).toHaveValue('');
  });
});
