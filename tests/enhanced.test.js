#!/usr/bin/env node

import { EnhancedAIAgent } from '../lib/index.js';
import { promises as fs } from 'fs';
import { fileExists } from '../lib/actions.js';

/**
 * Test suite for enhanced AI agent functionality
 */
async function runEnhancedTests() {
  console.log('🧪 Running Enhanced AI Agent Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Enhanced agent creation
  try {
    console.log('Test 1: Creating enhanced agent...');
    const agent = new EnhancedAIAgent({
      model: 'gpt-3.5-turbo',
      enableActions: false // Disable actions for testing
    });
    
    if (agent && typeof agent.query === 'function' && typeof agent.setActionsEnabled === 'function') {
      console.log('✅ Enhanced agent created successfully');
      passed++;
    } else {
      throw new Error('Enhanced agent missing required methods');
    }
  } catch (error) {
    console.log('❌ Enhanced agent creation failed:', error.message);
    failed++;
  }
  
  // Test 2: Actions enabled/disabled toggle
  try {
    console.log('\nTest 2: Testing actions toggle...');
    const agent = new EnhancedAIAgent({ enableActions: true });
    
    if (agent.getActionsEnabled() === true) {
      agent.setActionsEnabled(false);
      if (agent.getActionsEnabled() === false) {
        agent.setActionsEnabled(true);
        if (agent.getActionsEnabled() === true) {
          console.log('✅ Actions toggle works correctly');
          passed++;
        } else {
          throw new Error('Failed to re-enable actions');
        }
      } else {
        throw new Error('Failed to disable actions');
      }
    } else {
      throw new Error('Actions not enabled by default');
    }
  } catch (error) {
    console.log('❌ Actions toggle test failed:', error.message);
    failed++;
  }
  
  // Test 3: File existence check
  try {
    console.log('\nTest 3: Testing file existence check...');
    const packageExists = await fileExists('./package.json');
    const nonExistentExists = await fileExists('./non-existent-file.xyz');
    
    if (packageExists === true && nonExistentExists === false) {
      console.log('✅ File existence check works correctly');
      passed++;
    } else {
      throw new Error(`File existence check failed: package.json=${packageExists}, non-existent=${nonExistentExists}`);
    }
  } catch (error) {
    console.log('❌ File existence test failed:', error.message);
    failed++;
  }
  
  // Test 4: Action parsing (without execution)
  try {
    console.log('\nTest 4: Testing action parsing...');
    const agent = new EnhancedAIAgent({ enableActions: false });
    
    // Mock response with actions
    const mockResponse = 'I will read the file: ACTION:READ_FILE:test.txt\nAnd then list files: ACTION:LIST_FILES:.';
    
    // Check if action regex can find actions
    const actionRegex = /ACTION:([A-Z_]+):([^\n]+)/g;
    const matches = [...mockResponse.matchAll(actionRegex)];
    
    if (matches.length === 2 && matches[0][1] === 'READ_FILE' && matches[1][1] === 'LIST_FILES') {
      console.log('✅ Action parsing works correctly');
      passed++;
    } else {
      throw new Error(`Action parsing failed: found ${matches.length} matches`);
    }
  } catch (error) {
    console.log('❌ Action parsing test failed:', error.message);
    failed++;
  }
  
  // Test results
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All enhanced functionality tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnhancedTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { runEnhancedTests };