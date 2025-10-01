
const crypto = require('crypto');

const JWT_SECRET = 'jwt-secret-key';

const header = {
  alg: 'HS256',
  typ: 'JWT'
};

const now = Math.floor(Date.now() / 1000);
const oneYearFromNow = now + (365 * 24 * 60 * 60);

const payload = {
  sub: '1234567890',
  name: 'API User',
  email: 'api@productaggregator.com',
  role: 'admin',
  iat: now,
  exp: oneYearFromNow,
  iss: 'product-aggregator-api',
  aud: 'product-aggregator-client'
};

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function createJWT(header, payload, secret) {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${data}.${signature}`;
}

const token = createJWT(header, payload, JWT_SECRET);

console.log('🔑 Generated Long-lasting JWT Token (365 days):');
console.log('='.repeat(80));
console.log(token);
console.log('='.repeat(80));

console.log('\n📋 Token Details:');
console.log('Issued At:', new Date(payload.iat * 1000).toISOString());
console.log('Expires At:', new Date(payload.exp * 1000).toISOString());
console.log('Valid For:', Math.floor((payload.exp - payload.iat) / (24 * 60 * 60)), 'days');

console.log('\n📄 Token Payload:');
console.log(JSON.stringify(payload, null, 2));

console.log('\n📝 Instructions:');
console.log('1. Copy the token above');
console.log('2. Update the "jwt_token" variable in your Postman collection');
console.log('3. Or update the jwt_token variable in your environment file');
console.log('4. This token will be valid for 365 days from now');

console.log('\n🔒 Security Note:');
console.log('This is a long-lasting token for testing purposes.');
console.log('In production, consider shorter expiration times for better security.');

console.log('\n🔧 Environment Variables Used:');
console.log('JWT_SECRET_KEY:', JWT_SECRET);
