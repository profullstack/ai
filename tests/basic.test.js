#!/usr/bin/env node

import { AIAgent, getConfig, updateConfig, resetConfig } from '../lib/index.js';

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running AI Agent Tests\n');

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
}

const test = new TestRunner();

// Test AIAgent creation
test.test('AIAgent can be created', () => {
  const agent = new AIAgent();
  test.assert(agent instanceof AIAgent, 'Agent should be instance of AIAgent');
  test.assertEqual(agent.model, 'gpt-3.5-turbo', 'Default model should be gpt-3.5-turbo');
  test.assertEqual(agent.temperature, 0.7, 'Default temperature should be 0.7');
});

// Test AIAgent with custom options
test.test('AIAgent accepts custom options', () => {
  const agent = new AIAgent({
    model: 'gpt-4',
    temperature: 0.5,
    maxTokens: 2000
  });
  test.assertEqual(agent.model, 'gpt-4', 'Model should be set to gpt-4');
  test.assertEqual(agent.temperature, 0.5, 'Temperature should be set to 0.5');
  test.assertEqual(agent.maxTokens, 2000, 'Max tokens should be set to 2000');
});

// Test conversation history structure (without API calls)
test.test('AIAgent maintains conversation history structure', () => {
  const agent = new AIAgent();
  
  // Test initial state
  const history = agent.getHistory();
  test.assertEqual(history.length, 0, 'Should start with empty history');
  
  // Test that history methods exist
  test.assert(typeof agent.getHistory === 'function', 'Should have getHistory method');
  test.assert(typeof agent.clearHistory === 'function', 'Should have clearHistory method');
});

// Test conversation stats structure (without API calls)
test.test('AIAgent provides conversation stats structure', () => {
  const agent = new AIAgent();
  
  const stats = agent.getStats();
  test.assertEqual(stats.totalMessages, 0, 'Should start with 0 total messages');
  test.assertEqual(stats.userMessages, 0, 'Should start with 0 user messages');
  test.assertEqual(stats.assistantMessages, 0, 'Should start with 0 assistant messages');
  test.assertEqual(stats.model, 'gpt-3.5-turbo', 'Should have correct model in stats');
});

// Test clear history functionality
test.test('AIAgent can clear history', () => {
  const agent = new AIAgent();
  
  // Manually add a message to test clearing
  agent.conversationHistory.push({
    role: 'user',
    content: 'Test message',
    timestamp: new Date().toISOString()
  });
  
  test.assert(agent.getHistory().length > 0, 'Should have messages before clear');
  
  agent.clearHistory();
  test.assertEqual(agent.getHistory().length, 0, 'Should have no messages after clear');
});

// Test export history functionality
test.test('AIAgent can export history', () => {
  const agent = new AIAgent();
  
  // Manually add messages to test export
  agent.conversationHistory.push({
    role: 'user',
    content: 'Test message',
    timestamp: new Date().toISOString()
  });
  agent.conversationHistory.push({
    role: 'assistant',
    content: 'Test response',
    timestamp: new Date().toISOString()
  });
  
  const jsonExport = agent.exportHistory('json');
  const textExport = agent.exportHistory('text');
  const markdownExport = agent.exportHistory('markdown');
  
  test.assert(jsonExport.includes('user'), 'JSON export should contain user role');
  test.assert(textExport.includes('USER:'), 'Text export should contain USER: prefix');
  test.assert(markdownExport.includes('**User**'), 'Markdown export should contain **User** formatting');
});

// Test configuration functionality
test.test('Configuration can be loaded and updated', () => {
  const config = getConfig();
  test.assert(typeof config === 'object', 'Config should be an object');
  test.assert(config.hasOwnProperty('model'), 'Config should have model property');
  
  // Test updating config
  const originalModel = config.model;
  updateConfig('model', 'test-model');
  
  const updatedConfig = getConfig();
  test.assertEqual(updatedConfig.model, 'test-model', 'Config should be updated');
  
  // Restore original
  updateConfig('model', originalModel);
});

// Test configuration reset
test.test('Configuration can be reset', () => {
  // Update config first
  updateConfig('model', 'test-model');
  
  // Reset config
  resetConfig();
  
  const config = getConfig();
  test.assertEqual(config.model, 'gpt-3.5-turbo', 'Config should be reset to default');
});

// Run all tests
test.run().catch(console.error);