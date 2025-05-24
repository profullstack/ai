import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ai');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are a helpful AI assistant.',
  verbose: false,
  openaiApiKey: null,
  anthropicApiKey: null,
  apiEndpoint: null,
  conversationHistory: {
    enabled: true,
    maxMessages: 100,
    autoSave: true
  },
  display: {
    colors: true,
    spinner: true,
    timestamps: false
  }
};

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

// Load configuration from file
function loadConfig() {
  ensureConfigDir();
  
  if (!fs.existsSync(CONFIG_FILE)) {
    // Create default config file if it doesn't exist
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    
    // Merge with defaults to ensure all properties exist
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.warn(`Warning: Could not load config file. Using defaults. Error: ${error.message}`);
    return { ...DEFAULT_CONFIG };
  }
}

// Save configuration to file
function saveConfig(config) {
  ensureConfigDir();
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error.message}`);
  }
}

// Get current configuration
export function getConfig() {
  return loadConfig();
}

// Update configuration
export function updateConfig(key, value) {
  const config = loadConfig();
  
  // Handle nested keys (e.g., "display.colors")
  const keys = key.split('.');
  let current = config;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  // Convert string values to appropriate types
  let convertedValue = value;
  if (value === 'true') convertedValue = true;
  else if (value === 'false') convertedValue = false;
  else if (!isNaN(value) && !isNaN(parseFloat(value))) convertedValue = parseFloat(value);
  
  current[keys[keys.length - 1]] = convertedValue;
  
  saveConfig(config);
  return config;
}

// Reset configuration to defaults
export function resetConfig() {
  saveConfig(DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG };
}

// Get configuration file path
export function getConfigFilePath() {
  return CONFIG_FILE;
}

// Export configuration to a file
export function exportConfig(filePath) {
  const config = loadConfig();
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

// Import configuration from a file
export function importConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Configuration file not found: ${filePath}`);
  }
  
  try {
    const configData = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(configData);
    
    // Validate and merge with defaults
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    saveConfig(mergedConfig);
    
    return mergedConfig;
  } catch (error) {
    throw new Error(`Failed to import configuration: ${error.message}`);
  }
}

// Validate configuration
export function validateConfig(config = null) {
  const configToValidate = config || loadConfig();
  const errors = [];
  
  // Validate model
  if (typeof configToValidate.model !== 'string' || !configToValidate.model.trim()) {
    errors.push('Model must be a non-empty string');
  }
  
  // Validate temperature
  if (typeof configToValidate.temperature !== 'number' || 
      configToValidate.temperature < 0 || 
      configToValidate.temperature > 2) {
    errors.push('Temperature must be a number between 0 and 2');
  }
  
  // Validate maxTokens
  if (typeof configToValidate.maxTokens !== 'number' || 
      configToValidate.maxTokens < 1 || 
      configToValidate.maxTokens > 100000) {
    errors.push('Max tokens must be a number between 1 and 100000');
  }
  
  // Validate systemPrompt
  if (typeof configToValidate.systemPrompt !== 'string') {
    errors.push('System prompt must be a string');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Get available models (placeholder for future expansion)
export function getAvailableModels() {
  return [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'claude-3-sonnet',
    'claude-3-opus',
    'claude-3-haiku'
  ];
}

// Get the OpenAI API key from config or environment
export function getOpenAIKey() {
  // First check environment variable
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // Then check config file
  const config = loadConfig();
  return config.openaiApiKey || null;
}

// Set the OpenAI API key in the config
export function setOpenAIKey(apiKey) {
  const config = loadConfig();
  config.openaiApiKey = apiKey;
  saveConfig(config);
}

// Get the Anthropic API key from config or environment
export function getAnthropicKey() {
  // First check environment variable
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  
  // Then check config file
  const config = loadConfig();
  return config.anthropicApiKey || null;
}

// Set the Anthropic API key in the config
export function setAnthropicKey(apiKey) {
  const config = loadConfig();
  config.anthropicApiKey = apiKey;
  saveConfig(config);
}

// Get configuration schema for documentation
export function getConfigSchema() {
  return {
    model: {
      type: 'string',
      description: 'AI model to use for responses',
      default: DEFAULT_CONFIG.model,
      options: getAvailableModels()
    },
    temperature: {
      type: 'number',
      description: 'Response creativity (0.0 = deterministic, 2.0 = very creative)',
      default: DEFAULT_CONFIG.temperature,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: 'number',
      description: 'Maximum length of AI responses',
      default: DEFAULT_CONFIG.maxTokens,
      min: 1,
      max: 100000
    },
    systemPrompt: {
      type: 'string',
      description: 'System prompt that defines the AI\'s behavior',
      default: DEFAULT_CONFIG.systemPrompt
    },
    verbose: {
      type: 'boolean',
      description: 'Enable verbose logging',
      default: DEFAULT_CONFIG.verbose
    },
    openaiApiKey: {
      type: 'string',
      description: 'OpenAI API key for GPT models',
      default: null,
      sensitive: true
    },
    anthropicApiKey: {
      type: 'string',
      description: 'Anthropic API key for Claude models',
      default: null,
      sensitive: true
    },
    apiEndpoint: {
      type: 'string',
      description: 'Custom API endpoint (if using self-hosted service)',
      default: null
    }
  };
}