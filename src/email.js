import { isValidEmail } from './validator.js';

/**
 * 사용자 배열에서 이메일 필드만 추출한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {string[]} 이메일 문자열 배열
 */
export function extractEmails(users) {
  if (!Array.isArray(users)) {
    return [];
  }
  return users.map((user) => user.email);
}

/**
 * 사용자 목록에서 유효한 이메일만 반환한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {string[]} 유효한 이메일 배열
 */
export function getValidEmails(users) {
  return extractEmails(users).filter(isValidEmail);
}

/**
 * 사용자 목록에서 유효한 이메일만 추출하고 중복을 제거한다.
 * @param {Array<{ email?: string }>} users - 사용자 객체 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 목록
 */
export function uniqueValidEmails(users) {
  return [...new Set(getValidEmails(users))];
}

export { isValidEmail };
