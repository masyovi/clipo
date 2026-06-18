// Daemon launcher - double fork to truly detach from terminal
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'dev.log');
const pidPath = path.join(__dirname, 'server.pid');

// Clear log
fs.writeFileSync(logPath, '');

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(
  process.execPath,
  [nextBin, 'dev', '-p', '3000'],
  {
    cwd: __dirname,
    detached: true,
    stdio: ['ignore', fs.openSync(logPath, 'a'), fs.openSync(logPath, 'a')],
    env: { ...process.env, NODE_ENV: 'development' },
  }
);

// Write PID file
fs.writeFileSync(pidPath, String(child.pid));

// Unref so parent can exit
child.unref();

// Exit immediately
process.exit(0);