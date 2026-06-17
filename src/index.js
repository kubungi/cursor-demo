import { startServer } from './server.js';

const port = Number(process.env.PORT) || 3000;
const server = startServer(port);

server.on('listening', () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
