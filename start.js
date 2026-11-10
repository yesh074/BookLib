import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting BookMind AI Application...');
console.log('1. Launching Express Backend Server (Port 5000)...');

const server = spawn(process.execPath, ['src/index.js'], {
  cwd: path.resolve(__dirname, 'server'),
  stdio: 'inherit',
  shell: false
});

console.log('2. Launching Vite Frontend Dev Server (Port 5173)...');

const client = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5173', '--host'], {
  cwd: path.resolve(__dirname, 'client'),
  stdio: 'inherit',
  shell: false
});

console.log('\n========================================');
console.log('✨ BookMind AI is running at:');
console.log('   Local Web URL: http://localhost:5173');
console.log('   Backend API:   http://localhost:5000');
console.log('========================================\n');

const cleanup = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
