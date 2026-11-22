import bcrypt from 'bcryptjs';
export function validatePassword(value: string): boolean { return value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value); }
export async function hashPassword(value: string): Promise<string> { return bcrypt.hash(value, 12); }
export async function verifyPassword(value: string, hash: string): Promise<boolean> { return bcrypt.compare(value, hash); }
