export type AccountIdentity = {
  phone: string | null;
  email: string | null;
  normalizedAccount: string;
  accountType: 'phone' | 'email';
};

const MAINLAND_PHONE_PATTERN = /^1[3-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseAccountIdentity(account: string): AccountIdentity | null {
  const normalized = account.trim().toLowerCase();

  if (MAINLAND_PHONE_PATTERN.test(normalized)) {
    return {
      phone: normalized,
      email: null,
      normalizedAccount: normalized,
      accountType: 'phone',
    };
  }

  if (EMAIL_PATTERN.test(normalized)) {
    return {
      phone: null,
      email: normalized,
      normalizedAccount: normalized,
      accountType: 'email',
    };
  }

  return null;
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) {
    return email;
  }

  const visible = name.length <= 2 ? name[0] : `${name[0]}${name.at(-1)}`;
  return `${visible}***@${domain}`;
}
