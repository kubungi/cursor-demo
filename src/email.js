const { isValidEmail } = require('./validator.js');

function extractEmails(members) {
    if (!Array.isArray(members)) {
        return [];
    }
    return members.map(member => member.email);
}

function getValidEmails(members) {
    return extractEmails(members).filter(isValidEmail);
}

/**
 * 멤버 목록에서 유효한 이메일만 추출하고 중복을 제거한다.
 * @param {Array<{ email?: string }>} members - 멤버 객체 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 목록
 */
function uniqueValidEmails(members) {
    return [...new Set(getValidEmails(members))];
}

module.exports = { extractEmails, isValidEmail, getValidEmails, uniqueValidEmails };
