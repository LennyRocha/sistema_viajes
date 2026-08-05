/**
 * 1234123412341234 -> 1234 1234 1234 1234
 */
export const formatCardNumber = (value: string): string => {
  return value
    .replace(/\D/g, "") // Solo números
    .slice(0, 16) // Máximo 16 dígitos (Visa/Mastercard)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
};

/**
 * 5551223345 -> 555 122 33 45
 */
export const formatPhoneNumber = (
  value: string,
): string => {
  return value
    .replace(/\D/g, "") // Solo números
    .slice(0, 10) // Máximo 10 dígitos (Teléfono)
    .replace(/(\d{3})(?=\d)/g, "$1 ");
};

/**
 * 1 -> 1
 * 12 -> 12
 * 123 -> 12/3
 * 1234 -> 12/34
 */
export const formatExpiryDate = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 4);

  if (numbers.length <= 2) return numbers;

  return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
};

/**
 * Solo números, máximo 3 dígitos
 */
export const formatCVV = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, 3);
};
