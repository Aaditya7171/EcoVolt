require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '[HIDDEN]' : 'UNDEFINED');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[HIDDEN]' : 'UNDEFINED');

console.log('\n=== All Environment Variables ===');
Object.keys(process.env).filter(key => key.startsWith('DB_')).forEach(key => {
  console.log(`${key}:`, key.includes('PASS') ? '[HIDDEN]' : process.env[key]);
});
