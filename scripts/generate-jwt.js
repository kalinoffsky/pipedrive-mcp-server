#!/usr/bin/env node

/**
 * JWT Token Generator for Pipedrive MCP Server
 *
 * Usage:
 *   node scripts/generate-jwt.js                  # Generate new secret + token
 *   node scripts/generate-jwt.js --secret <s>     # Generate token for existing secret
 *   node scripts/generate-jwt.js --name "Vasya"   # Add colleague name to token
 *
 * Output: ready-to-use values for Railway variables and colleague config.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const secret = getArg('secret') || crypto.randomBytes(48).toString('base64url');
const name = getArg('name') || 'default';
const algorithm = 'HS256';

const payload = {
  sub: name,
  iat: Math.floor(Date.now() / 1000),
  iss: 'pipedrive-mcp-server',
  aud: 'pipedrive-mcp',
};

const token = jwt.sign(payload, secret, { algorithm });

// Verify it works
jwt.verify(token, secret, {
  algorithms: [algorithm],
  issuer: 'pipedrive-mcp-server',
  audience: 'pipedrive-mcp',
});

console.log('='.repeat(60));
console.log('JWT credentials generated successfully');
console.log('='.repeat(60));
console.log();
console.log('1) Add these variables in Railway (Settings > Variables):');
console.log();
console.log(`   MCP_JWT_SECRET    = ${secret}`);
console.log(`   MCP_JWT_TOKEN     = ${token}`);
console.log(`   MCP_JWT_ALGORITHM = ${algorithm}`);
console.log(`   MCP_JWT_ISSUER    = pipedrive-mcp-server`);
console.log(`   MCP_JWT_AUDIENCE  = pipedrive-mcp`);
console.log();
console.log('2) Give this config to your colleague:');
console.log();
console.log(JSON.stringify({
  mcpServers: {
    pipedrive: {
      url: 'https://YOUR-DOMAIN.up.railway.app/sse',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  },
}, null, 2));
console.log();
console.log('='.repeat(60));
console.log();
console.log('To generate additional tokens for other colleagues:');
console.log(`  node scripts/generate-jwt.js --secret "${secret}" --name "colleague-name"`);
console.log();
