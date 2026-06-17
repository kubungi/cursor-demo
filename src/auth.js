import crypto from 'node:crypto';
import { isValidEmail } from './validator.js';
import { verifyPassword } from './users.js';

const TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * 로그인 요청 본문을 파싱하고 유효성을 검사한다.
 * @param {unknown} body - 파싱된 JSON 본문
 * @returns {{ ok: true, email: string, password: string } | { ok: false, error: string }} 파싱 결과
 */
export function parseLoginBody(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: '요청 본문이 올바르지 않습니다.' };
  }

  const { email, password } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { ok: false, error: '이메일과 비밀번호는 문자열이어야 합니다.' };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: '유효하지 않은 이메일 형식입니다.' };
  }

  if (password.length === 0) {
    return { ok: false, error: '비밀번호를 입력해 주세요.' };
  }

  return { ok: true, email, password };
}

/**
 * 이메일과 비밀번호로 로그인을 시도한다.
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @param {Array<{ email: string, salt: string, passwordHash: string }>} users - 사용자 목록
 * @returns {{ ok: true, user: { email: string } } | { ok: false, error: string }} 로그인 결과
 */
export function authenticate(email, password, users) {
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  return { ok: true, user: { email: user.email } };
}

/**
 * 로그인 세션 토큰을 발급한다.
 * @param {string} email - 사용자 이메일
 * @param {string} secret - HMAC 서명 비밀키
 * @returns {string} 서명된 토큰
 */
export function issueToken(email, secret) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${email}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

/**
 * 로그인 요청을 처리한다.
 * @param {unknown} body - 파싱된 JSON 본문
 * @param {Array<{ email: string, salt: string, passwordHash: string }>} users - 사용자 목록
 * @param {string} secret - 토큰 서명 비밀키
 * @returns {{ status: number, body: Record<string, string> }} HTTP 응답 페이로드
 */
export function handleLogin(body, users, secret) {
  const parsed = parseLoginBody(body);
  if (!parsed.ok) {
    return { status: 400, body: { error: parsed.error } };
  }

  const auth = authenticate(parsed.email, parsed.password, users);
  if (!auth.ok) {
    return { status: 401, body: { error: auth.error } };
  }

  const token = issueToken(auth.user.email, secret);
  return { status: 200, body: { token } };
}
