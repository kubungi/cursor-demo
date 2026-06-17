import crypto from 'node:crypto';

const SCRYPT_KEYLEN = 64;

/**
 * 비밀번호를 scrypt로 해시한다.
 * @param {string} password - 평문 비밀번호
 * @param {string} salt - 솔트 문자열
 * @returns {string} 16진수 해시
 */
export function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
}

/**
 * 평문 비밀번호가 저장된 해시와 일치하는지 검증한다.
 * @param {string} password - 평문 비밀번호
 * @param {string} salt - 솔트 문자열
 * @param {string} expectedHash - 저장된 해시
 * @returns {boolean} 일치하면 true
 */
export function verifyPassword(password, salt, expectedHash) {
  const actualHash = hashPassword(password, salt);
  const a = Buffer.from(actualHash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * 환경 변수 또는 기본값으로 데모 사용자 목록을 만든다.
 * @returns {Array<{ email: string, salt: string, passwordHash: string }>} 사용자 목록
 */
export function createDemoUsers() {
  const email = process.env.DEMO_USER_EMAIL ?? 'admin@example.com';
  const password = process.env.DEMO_USER_PASSWORD ?? 'changeme123';
  const salt = process.env.DEMO_USER_SALT ?? 'cursor-demo-demo-salt';

  return [
    {
      email,
      salt,
      passwordHash: hashPassword(password, salt),
    },
  ];
}
