import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEmails, isValidEmail, getValidEmails, uniqueValidEmails } from './email.js';

describe('extractEmails', () => {
  it('returns emails from member objects', () => {
    const members = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ];
    assert.deepEqual(extractEmails(members), ['alice@example.com', 'bob@example.com']);
  });

  it('returns empty array for non-array input', () => {
    assert.deepEqual(extractEmails(null), []);
    assert.deepEqual(extractEmails('not an array'), []);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    assert.equal(isValidEmail('user@example.com'), true);
  });

  it('rejects invalid email addresses', () => {
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail(null), false);
  });
});

describe('getValidEmails', () => {
  it('returns only valid emails from members', () => {
    const members = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'invalid-email' },
      { name: 'Carol', email: 'carol@test.org' },
    ];
    assert.deepEqual(getValidEmails(members), ['alice@example.com', 'carol@test.org']);
  });

  it('returns empty array for non-array input', () => {
    assert.deepEqual(getValidEmails(undefined), []);
  });
});

describe('uniqueValidEmails', () => {
  it('returns unique valid emails preserving first occurrence order', () => {
    const members = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'alice@example.com' },
      { name: 'Carol', email: 'carol@test.org' },
      { name: 'Dave', email: 'invalid-email' },
    ];
    assert.deepEqual(uniqueValidEmails(members), [
      'alice@example.com',
      'carol@test.org',
    ]);
  });

  it('returns empty array for non-array input', () => {
    assert.deepEqual(uniqueValidEmails(null), []);
  });
});
