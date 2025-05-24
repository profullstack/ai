import { AIAgent } from './agent.js';
import {
  getConfig,
  updateConfig,
  resetConfig,
  getConfigFilePath,
  exportConfig,
  importConfig,
  validateConfig,
  getAvailableModels,
  getConfigSchema,
  getOpenAIKey,
  setOpenAIKey,
  getAnthropicKey,
  setAnthropicKey
} from './config.js';

export {
  // Core AI agent
  AIAgent,
  
  // Configuration management
  getConfig,
  updateConfig,
  resetConfig,
  getConfigFilePath,
  exportConfig,
  importConfig,
  validateConfig,
  getAvailableModels,
  getConfigSchema,
  
  // API key management
  getOpenAIKey,
  setOpenAIKey,
  getAnthropicKey,
  setAnthropicKey
};

// Default export for convenience
export default AIAgent;