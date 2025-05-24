#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';
import { AIAgent } from '../lib/agent.js';
import { getConfig, updateConfig, resetConfig, getOpenAIKey, setOpenAIKey, getAnthropicKey, setAnthropicKey, getConfigFilePath } from '../lib/config.js';

const program = new Command();

// Helper function to create spinner
function createSpinner(text) {
  return ora({
    text,
    spinner: 'dots',
    color: 'cyan'
  });
}

// Interactive chat mode
async function startInteractiveMode(options = {}) {
  console.log(chalk.blue('🤖 AI Agent'));
  console.log(chalk.gray('Type your questions or commands. Type "exit" or "quit" to leave.\n'));

  const agent = new AIAgent(options);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('ai > ')
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const trimmedInput = input.trim();
    
    // Handle exit commands
    if (trimmedInput === 'exit' || trimmedInput === 'quit' || trimmedInput === 'q') {
      console.log(chalk.yellow('Goodbye! 👋'));
      rl.close();
      return;
    }

    // Handle help command
    if (trimmedInput === 'help' || trimmedInput === '?') {
      console.log(chalk.blue('\n📖 Available Commands:'));
      console.log(chalk.gray('  help, ?     - Show this help message'));
      console.log(chalk.gray('  clear       - Clear the conversation history'));
      console.log(chalk.gray('  config      - Show current configuration'));
      console.log(chalk.gray('  exit, quit  - Exit the AI agent'));
      console.log(chalk.gray('  <question>  - Ask the AI agent anything\n'));
      rl.prompt();
      return;
    }

    // Handle clear command
    if (trimmedInput === 'clear') {
      agent.clearHistory();
      console.log(chalk.green('✅ Conversation history cleared\n'));
      rl.prompt();
      return;
    }

    // Handle config command
    if (trimmedInput === 'config') {
      const config = getConfig();
      console.log(chalk.blue('\n⚙️ Current Configuration:'));
      console.log(JSON.stringify(config, null, 2));
      console.log();
      rl.prompt();
      return;
    }

    // Skip empty input
    if (!trimmedInput) {
      rl.prompt();
      return;
    }

    // Process AI query
    try {
      const spinner = createSpinner('Thinking...');
      spinner.start();

      const response = await agent.query(trimmedInput);
      
      spinner.stop();
      console.log(chalk.green('\n🤖 ') + response + '\n');
      
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}\n`));
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.yellow('\nGoodbye! 👋'));
    process.exit(0);
  });

  // Handle Ctrl+C gracefully
  rl.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nGoodbye! 👋'));
    process.exit(0);
  });
}

// Main interactive command (default)
program
  .command('chat', { isDefault: true })
  .description('Start interactive AI chat session')
  .option('-m, --model <model>', 'AI model to use', 'gpt-3.5-turbo')
  .option('-t, --temperature <temp>', 'Response creativity (0.0-2.0)', '0.7')
  .option('--max-tokens <tokens>', 'Maximum response length', '1000')
  .option('--system <prompt>', 'System prompt to use')
  .option('--verbose', 'Enable verbose output')
  .action(async (options) => {
    await startInteractiveMode(options);
  });

// Single query command
program
  .command('ask <question>')
  .description('Ask a single question and get a response')
  .option('-m, --model <model>', 'AI model to use', 'gpt-3.5-turbo')
  .option('-t, --temperature <temp>', 'Response creativity (0.0-2.0)', '0.7')
  .option('--max-tokens <tokens>', 'Maximum response length', '1000')
  .option('--system <prompt>', 'System prompt to use')
  .option('--verbose', 'Enable verbose output')
  .action(async (question, options) => {
    try {
      console.log(chalk.blue('🤖 AI Agent'));
      console.log(chalk.gray(`Question: ${question}\n`));

      const agent = new AIAgent(options);
      const spinner = createSpinner('Thinking...');
      spinner.start();

      const response = await agent.query(question);
      
      spinner.succeed(chalk.green('Response:'));
      console.log(response);

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Configuration management
program
  .command('config')
  .description('Manage AI agent configuration')
  .option('--show', 'Show current configuration')
  .option('--set <key=value>', 'Set configuration value')
  .option('--reset', 'Reset configuration to defaults')
  .option('--set-openai-key <key>', 'Set OpenAI API key')
  .option('--set-anthropic-key <key>', 'Set Anthropic API key')
  .option('--show-keys', 'Show API key status (without revealing keys)')
  .action(async (options) => {
    try {
      if (options.show) {
        const config = getConfig();
        // Hide sensitive keys in display
        const displayConfig = { ...config };
        if (displayConfig.openaiApiKey) {
          displayConfig.openaiApiKey = '***hidden***';
        }
        if (displayConfig.anthropicApiKey) {
          displayConfig.anthropicApiKey = '***hidden***';
        }
        console.log(chalk.blue('⚙️ Current Configuration:'));
        console.log(JSON.stringify(displayConfig, null, 2));
        return;
      }

      if (options.setOpenaiKey) {
        setOpenAIKey(options.setOpenaiKey);
        console.log(chalk.green('✅ OpenAI API key set successfully'));
        return;
      }

      if (options.setAnthropicKey) {
        setAnthropicKey(options.setAnthropicKey);
        console.log(chalk.green('✅ Anthropic API key set successfully'));
        return;
      }

      if (options.showKeys) {
        const openaiKey = getOpenAIKey();
        const anthropicKey = getAnthropicKey();
        
        console.log(chalk.blue('🔑 API Key Status:'));
        console.log(`OpenAI API Key: ${openaiKey ? chalk.green('✅ Set') : chalk.red('❌ Not set')}`);
        console.log(`Anthropic API Key: ${anthropicKey ? chalk.green('✅ Set') : chalk.red('❌ Not set')}`);
        
        if (openaiKey) {
          console.log(chalk.gray(`  OpenAI key source: ${process.env.OPENAI_API_KEY ? 'Environment variable' : 'Config file'}`));
        }
        if (anthropicKey) {
          console.log(chalk.gray(`  Anthropic key source: ${process.env.ANTHROPIC_API_KEY ? 'Environment variable' : 'Config file'}`));
        }
        return;
      }

      if (options.set) {
        const [key, value] = options.set.split('=');
        if (!key || value === undefined) {
          console.error(chalk.red('❌ Invalid format. Use: --set key=value'));
          process.exit(1);
        }
        
        updateConfig(key, value);
        console.log(chalk.green(`✅ Configuration updated: ${key} = ${value}`));
        return;
      }

      if (options.reset) {
        resetConfig();
        console.log(chalk.green('✅ Configuration reset to defaults'));
        return;
      }

      // Default: show current config
      const config = getConfig();
      // Hide sensitive keys in display
      const displayConfig = { ...config };
      if (displayConfig.openaiApiKey) {
        displayConfig.openaiApiKey = '***hidden***';
      }
      if (displayConfig.anthropicApiKey) {
        displayConfig.anthropicApiKey = '***hidden***';
      }
      console.log(chalk.blue('⚙️ Current Configuration:'));
      console.log(JSON.stringify(displayConfig, null, 2));

    } catch (error) {
      console.error(chalk.red(`❌ Configuration error: ${error.message}`));
      process.exit(1);
    }
  });

// Setup command for initial configuration
program
  .command('setup')
  .description('Interactive setup for API keys and configuration')
  .action(async () => {
    console.log('🤖 AI Agent Setup\n');
    
    // Check current API key status
    const currentOpenAIKey = getOpenAIKey();
    const currentAnthropicKey = getAnthropicKey();
    
    console.log('🔑 API Key Configuration\n');
    
    // OpenAI API Key Setup
    let openaiConfigured = !!currentOpenAIKey;
    
    if (currentOpenAIKey) {
      console.log('✅ OpenAI API key is already configured.');
      const { reconfigureOpenAI } = await prompts({
        type: 'confirm',
        name: 'reconfigureOpenAI',
        message: 'Do you want to update your OpenAI API key?',
        initial: false
      });
      
      if (reconfigureOpenAI) {
        openaiConfigured = false; // Will configure new API key
      }
    }
    
    if (!openaiConfigured) {
      console.log('To use OpenAI models (GPT-3.5, GPT-4), you need an OpenAI API key.');
      console.log('Get one at: https://platform.openai.com/api-keys\n');
      
      const { setupOpenAI } = await prompts({
        type: 'confirm',
        name: 'setupOpenAI',
        message: 'Would you like to configure your OpenAI API key?',
        initial: true
      });
      
      if (setupOpenAI) {
        const { openaiApiKey } = await prompts({
          type: 'password',
          name: 'openaiApiKey',
          message: 'Enter your OpenAI API key:',
          validate: value => value.length > 0 ? true : 'API key cannot be empty'
        });
        
        if (openaiApiKey) {
          try {
            setOpenAIKey(openaiApiKey);
            console.log('✅ OpenAI API key saved successfully!');
          } catch (error) {
            console.error('❌ Error saving OpenAI API key:', error.message);
          }
        }
      }
    }
    
    // Anthropic API Key Setup
    let anthropicConfigured = !!currentAnthropicKey;
    
    if (currentAnthropicKey) {
      console.log('\n✅ Anthropic API key is already configured.');
      const { reconfigureAnthropic } = await prompts({
        type: 'confirm',
        name: 'reconfigureAnthropic',
        message: 'Do you want to update your Anthropic API key?',
        initial: false
      });
      
      if (reconfigureAnthropic) {
        anthropicConfigured = false; // Will configure new API key
      }
    }
    
    if (!anthropicConfigured) {
      console.log('\nTo use Anthropic models (Claude), you need an Anthropic API key.');
      console.log('Get one at: https://console.anthropic.com/\n');
      
      const { setupAnthropic } = await prompts({
        type: 'confirm',
        name: 'setupAnthropic',
        message: 'Would you like to configure your Anthropic API key?',
        initial: true
      });
      
      if (setupAnthropic) {
        const { anthropicApiKey } = await prompts({
          type: 'password',
          name: 'anthropicApiKey',
          message: 'Enter your Anthropic API key:',
          validate: value => value.length > 0 ? true : 'API key cannot be empty'
        });
        
        if (anthropicApiKey) {
          try {
            setAnthropicKey(anthropicApiKey);
            console.log('✅ Anthropic API key saved successfully!');
          } catch (error) {
            console.error('❌ Error saving Anthropic API key:', error.message);
          }
        }
      }
    }
    
    // Configuration preferences
    console.log('\n⚙️ Configuration Preferences\n');
    
    const config = getConfig();
    console.log(`Current model: ${config.model}`);
    console.log(`Current temperature: ${config.temperature}`);
    console.log(`Current max tokens: ${config.maxTokens}`);
    
    const { configurePreferences } = await prompts({
      type: 'confirm',
      name: 'configurePreferences',
      message: 'Would you like to configure your AI preferences?',
      initial: true
    });
    
    if (configurePreferences) {
      const { model } = await prompts({
        type: 'select',
        name: 'model',
        message: 'Choose your preferred AI model:',
        choices: [
          { title: 'GPT-3.5 Turbo (Fast, cost-effective)', value: 'gpt-3.5-turbo' },
          { title: 'GPT-4 (More capable, slower)', value: 'gpt-4' },
          { title: 'GPT-4 Turbo (Latest GPT-4)', value: 'gpt-4-turbo' },
          { title: 'Claude 3 Haiku (Fast Anthropic model)', value: 'claude-3-haiku' },
          { title: 'Claude 3 Sonnet (Balanced Anthropic model)', value: 'claude-3-sonnet' },
          { title: 'Claude 3 Opus (Most capable Anthropic model)', value: 'claude-3-opus' }
        ],
        initial: 0
      });
      
      if (model) {
        updateConfig('model', model);
        console.log(`✅ Model set to: ${model}`);
      }
      
      const { temperature } = await prompts({
        type: 'number',
        name: 'temperature',
        message: 'Set creativity level (0.0 = deterministic, 1.0 = balanced, 2.0 = very creative):',
        initial: config.temperature,
        min: 0,
        max: 2,
        increment: 0.1
      });
      
      if (temperature !== undefined) {
        updateConfig('temperature', temperature);
        console.log(`✅ Temperature set to: ${temperature}`);
      }
      
      const { maxTokens } = await prompts({
        type: 'number',
        name: 'maxTokens',
        message: 'Set maximum response length (tokens):',
        initial: config.maxTokens,
        min: 100,
        max: 4000,
        increment: 100
      });
      
      if (maxTokens !== undefined) {
        updateConfig('maxTokens', maxTokens);
        console.log(`✅ Max tokens set to: ${maxTokens}`);
      }
    }
    
    // Final status
    console.log('\n🎉 Setup complete!\n');
    
    const finalOpenAIKey = getOpenAIKey();
    const finalAnthropicKey = getAnthropicKey();
    
    console.log('📊 Current Status:');
    console.log(`OpenAI API Key: ${finalOpenAIKey ? chalk.green('✅ Configured') : chalk.red('❌ Not set')}`);
    console.log(`Anthropic API Key: ${finalAnthropicKey ? chalk.green('✅ Configured') : chalk.red('❌ Not set')}`);
    
    const finalConfig = getConfig();
    console.log(`Model: ${finalConfig.model}`);
    console.log(`Temperature: ${finalConfig.temperature}`);
    console.log(`Max Tokens: ${finalConfig.maxTokens}`);
    
    console.log(`\n📁 Configuration saved to: ~/.config/ai/config.json`);
    
    console.log('\n🚀 Try it out:');
    console.log('  ai                           # Start interactive mode');
    console.log('  ai ask "Hello, how are you?" # Ask a single question');
    console.log('  ai config --show-keys        # Check API key status');
  });

// Export command
program
  .command('export')
  .description('Export all AI agent data and configuration to ~/ai-agent.zip')
  .action(async () => {
    console.log('📦 Exporting AI Agent Data\n');
    
    try {
      const { existsSync } = await import('fs');
      const { createWriteStream } = await import('fs');
      const archiver = await import('archiver');
      const { homedir } = await import('os');
      const { join, dirname } = await import('path');
      
      const configPath = getConfigFilePath();
      const configDir = dirname(configPath);
      const exportPath = join(homedir(), 'ai-agent.zip');
      
      // Check if config directory exists
      if (!existsSync(configDir)) {
        console.log('❌ No AI agent data found to export.');
        console.log(`Expected data directory: ${configDir}`);
        return;
      }
      
      // Create output stream
      const output = createWriteStream(exportPath);
      const archive = archiver.default('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      // Handle archive events
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Warning:', err.message);
        } else {
          throw err;
        }
      });
      
      archive.on('error', (err) => {
        throw err;
      });
      
      // Pipe archive data to the file
      archive.pipe(output);
      
      // Add the entire .config/ai directory to the zip
      // This will preserve the directory structure when extracted
      archive.directory(configDir, '.config/ai');
      
      // Finalize the archive
      await archive.finalize();
      
      // Wait for the output stream to finish
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });
      
      console.log(`✅ AI agent data exported to: ${exportPath}`);
      console.log(`📁 Archive size: ${archive.pointer()} bytes`);
      console.log('\n💡 To restore this data on another machine:');
      console.log(`   1. Copy ${exportPath} to the target machine`);
      console.log('   2. Extract: unzip ~/ai-agent.zip -d ~');
      console.log('   3. The data will be restored to ~/.config/ai/');
      console.log('\n📋 Exported data includes:');
      console.log('   • Configuration settings (model, temperature, etc.)');
      console.log('   • API keys (OpenAI, Anthropic)');
      console.log('   • All conversation history');
      
    } catch (error) {
      console.error('❌ Error exporting data:', error.message);
      
      if (error.message.includes('archiver')) {
        console.log('\n💡 Installing required dependency...');
        try {
          const { execSync } = await import('child_process');
          execSync('npm install archiver', { stdio: 'inherit' });
          console.log('✅ Dependency installed. Please run the export command again.');
        } catch (installError) {
          console.error('❌ Failed to install archiver dependency.');
          console.log('Please install manually: npm install archiver');
        }
      }
      
      process.exit(1);
    }
  });

// Set program info
program
  .name('ai')
  .description('Interactive AI agent for conversations and questions')
  .version('1.0.0');

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided and no default command
if (!process.argv.slice(2).length) {
  // Start interactive mode by default
  startInteractiveMode();
}