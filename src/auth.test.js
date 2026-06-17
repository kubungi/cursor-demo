import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authenticate, handleLogin, issueToken, parseLoginBody } from './auth.js';
import { hashPassword } from './users.js';

const testUsers = [
  {
    email: 'admin@example.com',
    salt: 'test-salt',
    passwordHash: hashPassword('secret123', 'test-salt'),
  },
];

describe('parseLoginBody', () => {
  it('accepts valid login payload', () => {
    const result = parseLoginBody({ email: 'admin@example.com', password: 'secret123' });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.email, 'admin@example.com');
      assert.equal(result.password, 'secret123');
    }
  });

  it('rejects invalid email', () => {
    const result = parseLoginBody({ email: 'bad-email', password: 'secret123' });
    assert.equal(result.ok, false);
  });
});

describe('authenticate', () => {
  it('returns user for valid credentials', () => {
    const result = authenticate('admin@example.com', 'secret123', testUsers);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.user.email, 'admin@example.com');
    }
  });

  it('rejects invalid password', () => {
    const result = authenticate('admin@example.com', 'wrong', testUsers);
    assert.equal(result.ok, false);
  });
});

describe('handleLogin', () => {
  it('returns token for successful login', () => {
    const result = handleLogin(
      { email: 'admin@example.com', password: 'secret123' },
      testUsers,
      'test-secret',
    );
    assert.equal(result.status, 200);
    assert.ok(result.body.token);
  });

  it('returns 401 for failed login', () => {
    const result = handleLogin(
      { email: 'admin@example.com', password: 'wrong' },
      testUsers,
      'test-secret',
    );
    assert.equal(result.status, 401);
  });
});

describe('issueToken', () => {
  it('returns a base64url token string', () => {
    const token = issueToken('admin@example.com', 'test-secret');
    assert.match(token, /^[A-Za-z0-9_-]+$/);
  });
});
