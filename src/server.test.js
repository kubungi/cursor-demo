import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from './server.js';
import { hashPassword } from './users.js';

/**
 * 테스트용 HTTP 요청을 보낸다.
 * @param {import('node:http').Server} server - 대상 서버
 * @param {string} path - 요청 경로
 * @param {unknown} body - JSON 본문
 * @returns {Promise<{ status: number, body: Record<string, string> }>} 응답
 */
function request(server, path, body) {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('서버 주소를 확인할 수 없습니다.');
  }

  return fetch(`http://127.0.0.1:${address.port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (res) => ({
    status: res.status,
    body: /** @type {Record<string, string>} */ (await res.json()),
  }));
}

describe('POST /api/login', () => {
  const users = [
    {
      email: 'admin@example.com',
      salt: 'server-test-salt',
      passwordHash: hashPassword('secret123', 'server-test-salt'),
    },
  ];
  const server = createServer({ users, secret: 'server-test-secret' });

  after(() => {
    server.close();
  });

  it('starts listening on an ephemeral port', async () => {
    await new Promise((resolve) => server.listen(0, resolve));
    assert.ok(server.address());
  });

  it('returns token for valid credentials', async () => {
    const response = await request(server, '/api/login', {
      email: 'admin@example.com',
      password: 'secret123',
    });
    assert.equal(response.status, 200);
    assert.ok(response.body.token);
  });

  it('returns 401 for invalid credentials', async () => {
    const response = await request(server, '/api/login', {
      email: 'admin@example.com',
      password: 'wrong',
    });
    assert.equal(response.status, 401);
  });
});
