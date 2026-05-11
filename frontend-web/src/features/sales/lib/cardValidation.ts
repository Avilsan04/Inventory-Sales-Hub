export function luhnCheck(raw: string): boolean {
  const digits = raw.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) return false;
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if ((digits.length - i) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function isExpiryValid(expiry: string): boolean {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!m) return false;
  const [, monthStr, yearStr] = m;
  if (!monthStr || !yearStr) return false;
  const exp = new Date(2000 + parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + 1, 1);
  return exp > new Date();
}
