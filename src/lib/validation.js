// Input validation helpers
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateScore(score) {
  return Number.isInteger(score) && score >= 1 && score <= 45;
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date <= new Date();
}

export function validateUUID(uuid) {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return re.test(uuid);
}

export function validateAmount(amount) {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 1000000;
}

export function validateContributionPercentage(percent) {
  const num = Number(percent);
  return !isNaN(num) && num >= 10 && num <= 100;
}

export function sanitizeString(str) {
  return String(str).trim().slice(0, 255);
}
