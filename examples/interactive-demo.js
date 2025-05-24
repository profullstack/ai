#!/usr/bin/env node

import { AIAgent } from '../lib/index.js';
import chalk from 'chalk';

async function interactiveDemo() {
  console.log(chalk.blue('🤖 AI Agent Interactive Demo'));
  console.log(chalk.gray('This demonstrates what the interactive mode looks like:\n'));

  const agent = new AIAgent({
    verbose: false
  });

  // Simulate interactive conversation
  const conversations = [
    'Hello!',
    'What can you do?',
    'Tell me about the weather',
    'What time is it?'
  ];

  for (const question of conversations) {
    console.log(chalk.cyan('ai > ') + question);
    
    try {
      const response = await agent.query(question);
      console.log(chalk.green('🤖 ') + response + '\n');
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}\n`));
    }
  }

  console.log(chalk.cyan('ai > ') + 'exit');
  console.log(chalk.yellow('Goodbye! 👋'));
  
  console.log(chalk.blue('\n📊 Final Stats:'));
  const stats = agent.getStats();
  console.log(`Total messages: ${stats.totalMessages}`);
  console.log(`User messages: ${stats.userMessages}`);
  console.log(`Assistant messages: ${stats.assistantMessages}`);
}

interactiveDemo().catch(console.error);