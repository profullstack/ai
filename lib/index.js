import { AIAgent } from './agent.js';
import { EnhancedAIAgent } from './enhanced-agent.js';
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
import {
  readFile,
  writeFile,
  deleteFile,
  executeCommand,
  listFiles,
  fileExists,
  resetPermissions,
  showPermissions,
  getApprovedCommands,
  addApprovedCommand,
  removeApprovedCommand,
  resetApprovedCommands,
  showApprovedCommands,
  ACTION_TYPES,
  PERMISSION_LEVELS
} from './actions.js';
import {
  applyFileDiff,
  previewFileDiff
} from './file-diff.js';

export {
  // Core AI agents
  AIAgent,
  EnhancedAIAgent,
  
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
  setAnthropicKey,
  
  // File and command operations
  readFile,
  writeFile,
  deleteFile,
  executeCommand,
  listFiles,
  fileExists,
  
  // Permission management
  resetPermissions,
  showPermissions,
  ACTION_TYPES,
  PERMISSION_LEVELS,
  
  // Approved commands management
  getApprovedCommands,
  addApprovedCommand,
  removeApprovedCommand,
  resetApprovedCommands,
  showApprovedCommands,
  
  // File diff operations
  applyFileDiff,
  previewFileDiff
};

// Default export for convenience
export default AIAgent;