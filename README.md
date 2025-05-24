# @profullstack/ai

A simple AI agent CLI tool for interactive conversations with AI.

## Installation

```bash
npm install -g @profullstack/ai
```

Or using pnpm:

```bash
pnpm add -g @profullstack/ai
```

## Usage

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

### Basic Usage

```javascript
import { AIAgent } from '@profullstack/ai';

const agent = new AIAgent({
  model: 'gpt-3.5-turbo',
  temperature: 0.7
});

const response = await agent.query('Hello, world!');
console.log(response);
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

### AIAgent Class

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