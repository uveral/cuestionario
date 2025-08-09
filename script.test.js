const { validateDNI } = require('./script');

describe('validateDNI', () => {
  test('should return true for a valid DNI', () => {
    expect(validateDNI('12345678Z')).toBe(true);
  });

  test('should return true for another valid DNI', () => {
    expect(validateDNI('87654321B')).toBe(true);
  });

  test('should return false for an invalid DNI (wrong letter)', () => {
    expect(validateDNI('12345678A')).toBe(false);
  });

  test('should return false for a DNI that is too short', () => {
    expect(validateDNI('12345')).toBe(false);
  });

  test('should return false for a DNI with invalid characters', () => {
    expect(validateDNI('1234567A')).toBe(false);
  });

  test('should return false for an empty string', () => {
    expect(validateDNI('')).toBe(false);
  });
});
