import http from 'node:http';
import { handleLogin } from './auth.js';
import { createDemoUsers } from './users.js';

const DEFAULT_PORT = 3000;

/**
 * HTTP 요청 본문을 읽어 JSON으로 파싱한다.
 * @param {import('node:http').IncomingMessage} req - HTTP 요청
 * @returns {Promise<unknown>} 파싱된 JSON 객체
 */
export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    const maxBytes = 1024 * 16;

    req.on('data', (chunk) => {
      totalLength += chunk.length;
      if (totalLength > maxBytes) {
        reject(new Error('요청 본문이 너무 큽니다.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('JSON 파싱에 실패했습니다.'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * JSON 응답을 전송한다.
 * @param {import('node:http').ServerResponse} res - HTTP 응답
 * @param {number} status - HTTP 상태 코드
 * @param {Record<string, string>} body - 응답 본문
 */
export function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/**
 * 로그인 API를 포함한 HTTP 서버를 생성한다.
 * @param {{ users?: Array<{ email: string, salt: string, passwordHash: string }>, secret?: string, port?: number }} [options] - 서버 옵션
 * @returns {import('node:http').Server} HTTP 서버 인스턴스
 */
export function createServer(options = {}) {
  const users = options.users ?? createDemoUsers();
  const secret = options.secret ?? process.env.AUTH_SECRET ?? 'dev-only-change-me';

  return http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/login') {
      try {
        const body = await readJsonBody(req);
        const result = handleLogin(body, users, secret);
        sendJson(res, result.status, result.body);
      } catch {
        sendJson(res, 400, { error: '요청을 처리할 수 없습니다.' });
      }
      return;
    }

    sendJson(res, 404, { error: '찾을 수 없는 경로입니다.' });
  });
}

/**
 * 서버를 지정 포트에서 수신 대기한다.
 * @param {number} [port] - 수신 포트
 * @returns {import('node:http').Server} 시작된 서버
 */
export function startServer(port = Number(process.env.PORT) || DEFAULT_PORT) {
  const server = createServer();
  server.listen(port);
  return server;
}
