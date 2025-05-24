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

// Test conversation history
test.test('AIAgent maintains conversation history', async () => {
  const agent = new AIAgent();
  
  await agent.query('Hello');
  await agent.query('How are you?');
  
  const history = agent.getHistory();
  test.assertEqual(history.length, 4, 'Should have 4 messages (2 user, 2 assistant)');
  test.assertEqual(history[0].role, 'user', 'First message should be from user');
  test.assertEqual(history[1].role, 'assistant', 'Second message should be from assistant');
});

// Test conversation stats
test.test('AIAgent provides conversation stats', async () => {
  const agent = new AIAgent();
  
  await agent.query('Test message');
  
  const stats = agent.getStats();
  test.assertEqual(stats.totalMessages, 2, 'Should have 2 total messages');
  test.assertEqual(stats.userMessages, 1, 'Should have 1 user message');
  test.assertEqual(stats.assistantMessages, 1, 'Should have 1 assistant message');
});

// Test clear history
test.test('AIAgent can clear history', async () => {
  const agent = new AIAgent();
  
  await agent.query('Test message');
  test.assert(agent.getHistory().length > 0, 'Should have messages before clear');
  
  agent.clearHistory();
  test.assertEqual(agent.getHistory().length, 0, 'Should have no messages after clear');
});

// Test export history
test.test('AIAgent can export history', async () => {
  const agent = new AIAgent();
  
  await agent.query('Test message');
  
  const jsonHistory = agent.exportHistory('json');
  test.assert(typeof jsonHistory === 'string', 'JSON export should be string');
  test.assert(jsonHistory.includes('Test message'), 'Export should contain test message');
  
  const textHistory = agent.exportHistory('text');
  test.assert(typeof textHistory === 'string', 'Text export should be string');
  test.assert(textHistory.includes('Test message'), 'Export should contain test message');
});

// Test configuration
test.test('Configuration can be loaded and updated', () => {
  const config = getConfig();
  test.assert(typeof config === 'object', 'Config should be an object');
  test.assert('model' in config, 'Config should have model property');
  
  const originalModel = config.model;
  updateConfig('model', 'test-model');
  
  const updatedConfig = getConfig();
  test.assertEqual(updatedConfig.model, 'test-model', 'Model should be updated');
  
  // Reset for other tests
  updateConfig('model', originalModel);
});

// Test configuration reset
test.test('Configuration can be reset', () => {
  updateConfig('model', 'test-model');
  resetConfig();
  
  const config = getConfig();
  test.assertEqual(config.model, 'gpt-3.5-turbo', 'Model should be reset to default');
});

// Run all tests
test.run().catch(console.error);