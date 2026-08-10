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
 * 123456 -> 123 456
 */
export const formatZipCode = (value: string): string => {
  return value
    .replace(/\D/g, "") // Solo números
    .slice(0, 6); // Máximo 6 dígitos (Código postal)
};

/**
 * 1 -> 1
 * 12 -> 12
 * 123 -> 12/3
 * 1234 -> 12/34
 */
export const formatExpiryDate = (value: string): string => {
  let numbers = value.replace(/\D/g, "").slice(0, 4);

  // Restringe el primer dígito del mes: solo 0 o 1
  if (
    numbers.length >= 1 &&
    !["0", "1"].includes(numbers[0])
  ) {
    numbers = numbers.slice(1); // descarta el dígito inválido
  }

  // Si el primer dígito es "1", el segundo solo puede ser 0, 1 o 2
  if (
    numbers.length >= 2 &&
    numbers.startsWith("1") &&
    !["0", "1", "2"].includes(numbers[1])
  ) {
    numbers = numbers.slice(0, 1); // corta antes del dígito inválido
  }

  if (numbers.length <= 2) return numbers;

  return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
};

/**
 * Solo números, máximo 3 dígitos
 */
export const formatCVV = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, 3);
};

/*
 * 123 -> **** 123
 */
export const maskCVV = (cvv: string): string => {
  return cvv.replaceAll(/\d/g, "*");
};

/**
 * Valida que la fecha de expiración sea válida y no esté vencida.
 * Formato esperado: MM/AA
 * Ejemplo: 12/25
 */
export const isExpiryDateValid = (
  expiry: string,
): boolean => {
  const match = new RegExp(/^(\d{2})\/(\d{2})$/).exec(expiry);
  if (!match) return false;

  const month = Number.parseInt(match[1], 10);
  const year = Number.parseInt(match[2], 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100; // 2 dígitos, ej: 25
  const currentMonth = now.getMonth() + 1;

  const maxYear = (currentYear + 25) % 100;

  // Año fuera del rango permitido
  const yearInRange =
    maxYear > currentYear
      ? year >= currentYear && year <= maxYear
      : year >= currentYear || year <= maxYear; // por si el módulo 100 da vuelta

  if (!yearInRange) return false;

  // Si es el año actual, el mes no puede ser anterior al mes actual
  if (year === currentYear && month < currentMonth)
    return false;

  return true;
};
