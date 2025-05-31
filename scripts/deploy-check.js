#!/usr/bin/env node

/**
 * EcoVolt Deployment Checker
 * This script helps verify that your project is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 EcoVolt Deployment Checker\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'backend/package.json',
  'backend/app.js',
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/vercel.json',
  'backend/.env.example',
  'frontend/.env.example',
  'frontend/.env.production',
  'render.yaml',
  'DEPLOYMENT.md'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: `File: ${file}`, passed: exists });
});

// Check package.json configurations
console.log('\n📦 Checking package.json configurations...');

// Backend package.json
try {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const hasStartScript = backendPkg.scripts && backendPkg.scripts.start;
  const hasNodeEngine = backendPkg.engines && backendPkg.engines.node;
  
  console.log(`${hasStartScript ? '✅' : '❌'} Backend has start script`);
  console.log(`${hasNodeEngine ? '✅' : '❌'} Backend has Node.js engine specified`);
  
  checks.push({ name: 'Backend start script', passed: hasStartScript });
  checks.push({ name: 'Backend Node.js engine', passed: hasNodeEngine });
} catch (error) {
  console.log('❌ Error reading backend package.json');
  checks.push({ name: 'Backend package.json', passed: false });
}

// Frontend package.json
try {
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const hasBuildScript = frontendPkg.scripts && frontendPkg.scripts.build;
  
  console.log(`${hasBuildScript ? '✅' : '❌'} Frontend has build script`);
  checks.push({ name: 'Frontend build script', passed: hasBuildScript });
} catch (error) {
  console.log('❌ Error reading frontend package.json');
  checks.push({ name: 'Frontend package.json', passed: false });
}

// Check environment configurations
console.log('\n🔧 Checking environment configurations...');

// Check if API URL is configurable in frontend
try {
  const apiFile = fs.readFileSync('frontend/src/services/api.js', 'utf8');
  const hasEnvVar = apiFile.includes('import.meta.env.VITE_API_URL');
  
  console.log(`${hasEnvVar ? '✅' : '❌'} Frontend API URL is configurable`);
  checks.push({ name: 'Frontend API URL configuration', passed: hasEnvVar });
} catch (error) {
  console.log('❌ Error checking frontend API configuration');
  checks.push({ name: 'Frontend API configuration', passed: false });
}

// Check CORS configuration in backend
try {
  const appFile = fs.readFileSync('backend/app.js', 'utf8');
  const hasCorsConfig = appFile.includes('process.env.FRONTEND_URL');
  
  console.log(`${hasCorsConfig ? '✅' : '❌'} Backend CORS is configurable`);
  checks.push({ name: 'Backend CORS configuration', passed: hasCorsConfig });
} catch (error) {
  console.log('❌ Error checking backend CORS configuration');
  checks.push({ name: 'Backend CORS configuration', passed: false });
}

// Summary
console.log('\n📊 Summary:');
const passed = checks.filter(check => check.passed).length;
const total = checks.length;

console.log(`✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${total - passed}/${total}`);

if (passed === total) {
  console.log('\n🎉 Your project is ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Follow the DEPLOYMENT.md guide');
  console.log('3. Deploy backend to Render');
  console.log('4. Deploy frontend to Vercel');
} else {
  console.log('\n⚠️  Please fix the failed checks before deploying.');
  console.log('Refer to DEPLOYMENT.md for detailed instructions.');
}

console.log('\n📚 For detailed deployment instructions, see DEPLOYMENT.md');
