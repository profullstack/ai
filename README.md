# @profullstack/ai

A powerful AI agent CLI tool for interactive conversations with AI, featuring file operations and command execution capabilities.

## Installation

```bash
npm install -g @profullstack/ai
```

Or using pnpm:

```bash
pnpm add -g @profullstack/ai
```

## Features

- 🤖 **Interactive AI Chat**: Conversational interface with AI models
- 📁 **File Operations**: Read, write, and delete files with permission prompts
- ⚡ **Command Execution**: Run system commands safely with user approval
- 🔐 **Permission System**: Granular control with "allow", "disallow", "allow forever" options
- 🔑 **Multi-Provider Support**: Works with OpenAI GPT and Anthropic Claude models
- ⚙️ **Flexible Configuration**: Customizable settings and API key management
- 📊 **Conversation History**: Track and export chat sessions

## Usage

### Enhanced Mode (Default)

The AI agent runs in enhanced mode by default, which enables file operations and command execution:

```bash
ai
```

This starts an interactive session where the AI can:
- Read and analyze files in your project
- Create, modify, and delete files (with your permission)
- Execute commands like `npm install`, `git status`, etc.
- List directory contents and check file existence

**Security**: You'll be prompted before any file or command operation with options:
- **Allow** (this time only)
- **Disallow** (reject the action)
- **Allow forever** (permanently allow this type of action)

### Text-Only Mode

To use the traditional text-only mode without file/command capabilities:

```bash
ai --no-enhanced
```

### Interactive Mode (Default)

Simply run `ai` to start an interactive chat session:

```bash
ai
```

This will start an interactive prompt where you can have conversations with the AI:

```
🤖 AI Agent
Type your questions or commands. Type "exit" or "quit" to leave.

ai > Hello, how are you?
🤖 Hello! I'm your AI assistant. How can I help you today?

ai > What can you do?
🤖 I can help you with a wide variety of tasks including:
• Answering questions on various topics
• Helping with writing and editing
• Explaining concepts and ideas
• Providing suggestions and recommendations
• Assisting with problem-solving
• And much more! Just ask me anything you'd like help with.

ai > exit
Goodbye! 👋
```

### Single Query Mode

Ask a single question and get a response:

```bash
ai ask "What is the capital of France?"
```

### Available Commands in Interactive Mode

- `help` or `?` - Show help message
- `clear` - Clear conversation history
- `config` - Show current configuration
- `exit`, `quit`, or `q` - Exit the AI agent

### Permission Management

Control what actions the AI can perform:

```bash
# Show current permissions
ai config --show-permissions

# Reset all permissions (will prompt again for each action)
ai config --reset-permissions
```

**Permission Types:**
- `file_read` - Reading files
- `file_write` - Writing/creating files
- `file_delete` - Deleting files
- `command_exec` - Executing system commands

**Permission Levels:**
- **Allow** (this time only) - Permit the action once
- **Disallow** - Reject the action
- **Allow forever** - Permanently allow this action type
- **[x] Auto-approve** - Automatically allow approved actions (for commands in approved list)

### Approved Commands Management

Control which commands can be auto-approved:

```bash
# Show approved commands list
ai config --show-commands

# Add a command to approved list
ai config --add-command "git status"

# Remove a command from approved list
ai config --remove-command "rm -rf"

# Reset to default approved commands
ai config --reset-commands
```

**Default Approved Commands:**
Safe, read-only commands like `ls`, `pwd`, `git status`, `npm list`, etc. are pre-approved for auto-execution when auto-approve mode is enabled.

## Quick Setup

For first-time setup, use the interactive setup command:

```bash
ai setup
```

This will guide you through:
- Setting up OpenAI and/or Anthropic API keys
- Choosing your preferred AI model
- Configuring response settings

## Configuration

### View Current Configuration

```bash
ai config --show
```

### Set Configuration Values

```bash
ai config --set model=gpt-4
ai config --set temperature=0.8
ai config --set maxTokens=2000
```

### API Key Management

```bash
# Interactive setup (recommended)
ai setup

# Manual API key setup
ai config --set-openai-key sk-your-openai-key-here
ai config --set-anthropic-key sk-ant-your-anthropic-key-here

# Check API key status
ai config --show-keys
```

API keys are stored securely in `~/.config/ai/config.json` and can also be set via environment variables:

```bash
export OPENAI_API_KEY=sk-your-openai-key-here
export ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

### Reset Configuration

```bash
ai config --reset
```

### Export/Import Configuration

```bash
# Export configuration to a file
ai config --export my-config.json

# Import configuration from a file
ai config --import my-config.json
```

### Export All Data

Export all your AI agent data (configuration, API keys, conversation history) to a zip file:

```bash
ai export
```

This creates `~/ai-agent.zip` containing:
- Configuration settings (model, temperature, etc.)
- API keys (OpenAI, Anthropic)
- All conversation history

To restore on another machine:
```bash
# Copy the zip file to the target machine, then:
unzip ~/ai-agent.zip -d ~
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `model` | string | `gpt-3.5-turbo` | AI model to use |
| `temperature` | number | `0.7` | Response creativity (0.0-2.0) |
| `maxTokens` | number | `1000` | Maximum response length |
| `systemPrompt` | string | `You are a helpful AI assistant.` | System prompt |
| `verbose` | boolean | `false` | Enable verbose output |
| `openaiApiKey` | string | `null` | OpenAI API key for GPT models |
| `anthropicApiKey` | string | `null` | Anthropic API key for Claude models |
| `apiEndpoint` | string | `null` | Custom API endpoint |

## Command Line Options

### Interactive Mode Options

```bash
ai chat [options]
```

Options:
- `-m, --model <model>` - AI model to use
- `-t, --temperature <temp>` - Response creativity (0.0-2.0)
- `--max-tokens <tokens>` - Maximum response length
- `--system <prompt>` - System prompt to use
- `--verbose` - Enable verbose output

### Single Query Options

```bash
ai ask <question> [options]
```

Same options as interactive mode.

## Examples

### Enhanced Agent Usage

```javascript
import { EnhancedAIAgent } from '@profullstack/ai';

const agent = new EnhancedAIAgent({
  model: 'gpt-3.5-turbo',
  temperature: 0.7
});

// AI can now read files, write files, and execute commands
const response = await agent.query('Read my package.json and create a simple README for this project');
console.log(response);
```

### Basic Agent Usage (Text-only)

```javascript
import { AIAgent } from '@profullstack/ai';

const agent = new AIAgent({
  model: 'gpt-3.5-turbo',
  temperature: 0.7
});

const response = await agent.query('Hello, world!');
console.log(response);
```

### File Operations

```javascript
import { readFile, writeFile, executeCommand } from '@profullstack/ai';

// These functions include built-in permission prompts
const content = await readFile('./myfile.txt');
await writeFile('./output.txt', 'Hello, world!');
const result = await executeCommand('npm test');
```

### Configuration Management

```javascript
import { getConfig, updateConfig, setOpenAIKey, getOpenAIKey } from '@profullstack/ai';

// Get current configuration
const config = getConfig();
console.log(config);

// Update configuration
updateConfig('temperature', 0.8);
updateConfig('model', 'gpt-4');

// Set API keys
setOpenAIKey('sk-your-openai-key-here');
setAnthropicKey('sk-ant-your-anthropic-key-here');

// Get API keys
const openaiKey = getOpenAIKey(); // Checks env var first, then config file
const anthropicKey = getAnthropicKey();
```

### Conversation History

```javascript
import { AIAgent } from '@profullstack/ai';

const agent = new AIAgent();

await agent.query('Hello!');
await agent.query('How are you?');

// Get conversation stats
const stats = agent.getStats();
console.log(stats);

// Export history
const history = agent.exportHistory('markdown');
console.log(history);

// Clear history
agent.clearHistory();
```

## Development

### Setup

```bash
git clone https://github.com/profullstack/ai.git
cd ai
pnpm install
```

### Run Examples

```bash
pnpm run example
```

### Run CLI Locally

```bash
pnpm run cli
```

## API Reference

### EnhancedAIAgent Class

The enhanced agent extends AIAgent with file and command capabilities.

#### Constructor

```javascript
new EnhancedAIAgent(options)
```

Options:
- `model` - AI model to use
- `temperature` - Response creativity
- `maxTokens` - Maximum response length
- `system` - System prompt
- `verbose` - Enable verbose output
- `enableActions` - Enable file/command operations (default: true)

#### Methods

- `query(message)` - Send a message and get a response (with action processing)
- `clearHistory()` - Clear conversation history
- `getHistory()` - Get conversation history
- `getStats()` - Get conversation statistics
- `exportHistory(format)` - Export history in specified format
- `setActionsEnabled(enabled)` - Enable/disable action processing
- `getActionsEnabled()` - Check if actions are enabled

### AIAgent Class

Basic text-only agent without file/command capabilities.

#### Constructor

```javascript
new AIAgent(options)
```

Options:
- `model` - AI model to use
- `temperature` - Response creativity
- `maxTokens` - Maximum response length
- `system` - System prompt
- `verbose` - Enable verbose output

#### Methods

- `query(message)` - Send a message and get a response
- `clearHistory()` - Clear conversation history
- `getHistory()` - Get conversation history
- `getStats()` - Get conversation statistics
- `exportHistory(format)` - Export history in specified format

### Configuration Functions

- `getConfig()` - Get current configuration
- `updateConfig(key, value)` - Update configuration value
- `resetConfig()` - Reset to default configuration
- `exportConfig(filePath)` - Export configuration to file
- `importConfig(filePath)` - Import configuration from file
- `validateConfig(config)` - Validate configuration
- `getAvailableModels()` - Get list of available models
- `getConfigSchema()` - Get configuration schema
### Action Functions

File and command operations with built-in permission prompts:

- `readFile(filePath)` - Read a file with permission check
- `writeFile(filePath, content)` - Write to a file with permission check
- `deleteFile(filePath)` - Delete a file with permission check
- `executeCommand(command, options)` - Execute a command with permission check
- `listFiles(dirPath)` - List files in a directory
- `fileExists(filePath)` - Check if a file exists

### Permission Functions

- `resetPermissions()` - Reset all action permissions
- `showPermissions()` - Display current permission settings
- `ACTION_TYPES` - Constants for action types
- `PERMISSION_LEVELS` - Constants for permission levels

### API Key Functions

- `getOpenAIKey()` - Get OpenAI API key (env var or config file)
- `setOpenAIKey(key)` - Set OpenAI API key in config file
- `getAnthropicKey()` - Get Anthropic API key (env var or config file)
- `setAnthropicKey(key)` - Set Anthropic API key in config file

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue on GitHub or contact us at support@profullstack.com.