#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test ${testFile} failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log('🧪 Running All Tests\n');

  const tests = [
    'basic.test.js',
    'enhanced.test.js',
    'enhanced-features.test.js'
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 Running ${test}...`);
      await runTest(test);
      console.log(`✅ ${test} passed`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test} failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Overall Results: ${passed} test files passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
  }
}

runAllTests().catch(console.error);