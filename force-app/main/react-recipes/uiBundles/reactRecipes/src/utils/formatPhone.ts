/**
 * Formats a phone number string into a readable format.
 *   10 digits          → (555) 555-5555
 *   11 digits, 1st=1   → +1 (555) 555-5555
 *   anything else      → returned as-is
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
