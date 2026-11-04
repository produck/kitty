process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

await import('./Deployer.test.mjs');
await import('./WebSocket.test.mjs');
