#!/usr/bin/env node

import { AIAgent } from '../lib/index.js';

async function basicExample() {
  console.log('🤖 Basic AI Agent Usage Example\n');

  // Create a new AI agent instance
  const agent = new AIAgent({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    verbose: true
  });

  try {
    // Ask a simple question
    console.log('Asking: "Hello, how are you?"');
    const response1 = await agent.query('Hello, how are you?');
    console.log('Response:', response1);
    console.log();

    // Ask another question
    console.log('Asking: "What can you help me with?"');
    const response2 = await agent.query('What can you help me with?');
    console.log('Response:', response2);
    console.log();

    // Show conversation stats
    const stats = agent.getStats();
    console.log('📊 Conversation Stats:');
    console.log(`Total messages: ${stats.totalMessages}`);
    console.log(`User messages: ${stats.userMessages}`);
    console.log(`Assistant messages: ${stats.assistantMessages}`);
    console.log(`Model: ${stats.model}`);
    console.log();

    // Export conversation history
    console.log('📝 Conversation History (JSON):');
    const history = agent.exportHistory('json');
    console.log(history);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
basicExample();