#!/usr/bin/env node

import { EnhancedAIAgent } from '../lib/index.js';

/**
 * Example demonstrating the enhanced AI agent with file operations and command execution
 */
async function demonstrateEnhancedAgent() {
  console.log('🚀 Enhanced AI Agent Demo\n');
  
  // Create an enhanced agent
  const agent = new EnhancedAIAgent({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    verbose: true
  });

  try {
    console.log('📝 Example 1: Ask AI to create a simple file');
    console.log('Question: "Create a simple hello.txt file with a greeting message"');
    
    const response1 = await agent.query(
      'Create a simple hello.txt file with a greeting message'
    );
    console.log('\nAI Response:');
    console.log(response1);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('📖 Example 2: Ask AI to read and analyze a file');
    console.log('Question: "Read the package.json file and tell me about this project"');
    
    const response2 = await agent.query(
      'Read the package.json file and tell me about this project'
    );
    console.log('\nAI Response:');
    console.log(response2);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('🔧 Example 3: Ask AI to run a command');
    console.log('Question: "List the files in the current directory"');
    
    const response3 = await agent.query(
      'List the files in the current directory using the ls command'
    );
    console.log('\nAI Response:');
    console.log(response3);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('📊 Conversation Statistics:');
    console.log(agent.getStats());

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEnhancedAgent().catch(console.error);
}

export { demonstrateEnhancedAgent };