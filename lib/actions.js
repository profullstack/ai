import { promises as fs } from 'fs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import prompts from 'prompts';
import chalk from 'chalk';
import { getConfig, updateConfig } from './config.js';

// Global readline interface for permission prompts
let globalReadlineInterface = null;

/**
 * Set the global readline interface to use for permission prompts
 * This prevents conflicts with the main chat readline interface
 */
export function setGlobalReadlineInterface(rl) {
  globalReadlineInterface = rl;
}

const execAsync = promisify(exec);

/**
 * Permission levels for actions
 */
const PERMISSION_LEVELS = {
  ALLOW: 'allow',
  DISALLOW: 'disallow',
  ALLOW_FOREVER: 'allow_forever',
  AUTO_APPROVE: 'auto_approve'
};

/**
 * Action types that require permission
 */
const ACTION_TYPES = {
  FILE_READ: 'file_read',
  FILE_WRITE: 'file_write',
  FILE_DELETE: 'file_delete',
  COMMAND_EXEC: 'command_exec'
};

/**
 * Default approved commands for auto-approval
 */
const DEFAULT_APPROVED_COMMANDS = [
  'ls', 'dir', 'pwd', 'whoami', 'date', 'echo', 'cat', 'head', 'tail',
  'grep', 'find', 'which', 'whereis', 'ps', 'top', 'df', 'du', 'free',
  'uname', 'hostname', 'uptime', 'history', 'env', 'printenv',
  'git status', 'git log', 'git diff', 'git branch', 'git remote',
  'npm list', 'npm outdated', 'npm audit', 'pnpm list', 'yarn list',
  'node --version', 'npm --version', 'python --version', 'java -version'
];

/**
 * Check if an action is permanently allowed
 * @param {string} actionType - Type of action
 * @returns {boolean} Whether action is permanently allowed
 */
function isActionAllowedForever(actionType) {
  const config = getConfig();
  const permissions = config.permissions || {};
  return permissions[actionType] === PERMISSION_LEVELS.ALLOW_FOREVER;
}

/**
 * Check if auto-approve is enabled for an action type
 * @param {string} actionType - Type of action
 * @returns {boolean} Whether auto-approve is enabled
 */
function isAutoApproveEnabled(actionType) {
  const config = getConfig();
  const permissions = config.permissions || {};
  return permissions[actionType] === PERMISSION_LEVELS.AUTO_APPROVE;
}

/**
 * Check if a command is in the approved list
 * @param {string} command - Command to check
 * @returns {boolean} Whether command is approved
 */
function isCommandApproved(command) {
  const config = getConfig();
  const approvedCommands = config.approvedCommands || DEFAULT_APPROVED_COMMANDS;
  
  // Check exact match first
  if (approvedCommands.includes(command)) {
    return true;
  }
  
  // Check if command starts with any approved command
  const commandBase = command.split(' ')[0];
  return approvedCommands.some(approved => {
    const approvedBase = approved.split(' ')[0];
    return commandBase === approvedBase;
  });
}

/**
 * Get approved commands list
 * @returns {string[]} List of approved commands
 */
export function getApprovedCommands() {
  const config = getConfig();
  return config.approvedCommands || DEFAULT_APPROVED_COMMANDS;
}

/**
 * Add command to approved list
 * @param {string} command - Command to approve
 */
export function addApprovedCommand(command) {
  const config = getConfig();
  const approvedCommands = config.approvedCommands || [...DEFAULT_APPROVED_COMMANDS];
  
  if (!approvedCommands.includes(command)) {
    approvedCommands.push(command);
    updateConfig('approvedCommands', approvedCommands);
  }
}

/**
 * Remove command from approved list
 * @param {string} command - Command to remove
 */
export function removeApprovedCommand(command) {
  const config = getConfig();
  const approvedCommands = config.approvedCommands || [...DEFAULT_APPROVED_COMMANDS];
  
  const index = approvedCommands.indexOf(command);
  if (index > -1) {
    approvedCommands.splice(index, 1);
    updateConfig('approvedCommands', approvedCommands);
  }
}

/**
 * Reset approved commands to defaults
 */
export function resetApprovedCommands() {
  updateConfig('approvedCommands', [...DEFAULT_APPROVED_COMMANDS]);
}

/**
 * Set permanent permission for an action type
 * @param {string} actionType - Type of action
 */
function setActionAllowedForever(actionType) {
  const config = getConfig();
  const permissions = config.permissions || {};
  permissions[actionType] = PERMISSION_LEVELS.ALLOW_FOREVER;
  updateConfig('permissions', permissions);
}

/**
 * Set auto-approve for an action type
 * @param {string} actionType - Type of action
 */
function setAutoApprove(actionType) {
  const config = getConfig();
  const permissions = config.permissions || {};
  permissions[actionType] = PERMISSION_LEVELS.AUTO_APPROVE;
  updateConfig('permissions', permissions);
}

/**
 * Prompt user for permission to perform an action
 * @param {string} actionType - Type of action
 * @param {string} description - Description of the action
 * @param {string} [command] - Command being executed (for command actions)
 * @returns {Promise<string>} Permission level granted
 */
async function promptForPermission(actionType, description, command = null) {
  console.log(chalk.yellow('\n⚠️  Permission Required'));
  console.log(chalk.gray(`Action: ${description}`));
  console.log(chalk.gray(`Type: ${actionType}`));
  
  // For command execution, show if command is in approved list
  if (actionType === ACTION_TYPES.COMMAND_EXEC && command) {
    const isApproved = isCommandApproved(command);
    console.log(chalk.gray(`Command approved: ${isApproved ? chalk.green('Yes') : chalk.red('No')}`));
    
    // If command is approved and auto-approve is enabled, allow automatically
    if (isApproved && isAutoApproveEnabled(actionType)) {
      console.log(chalk.green('✅ Auto-approved (command in approved list)'));
      return PERMISSION_LEVELS.ALLOW;
    }
  }
  
  const choices = [
    { title: 'Allow (this time only)', value: PERMISSION_LEVELS.ALLOW },
    { title: 'Disallow', value: PERMISSION_LEVELS.DISALLOW },
    { title: 'Allow forever (for this action type)', value: PERMISSION_LEVELS.ALLOW_FOREVER },
    { title: '[x] Auto-approve (allow approved actions automatically)', value: PERMISSION_LEVELS.AUTO_APPROVE }
  ];
  
  // For command execution, add option to approve the command
  if (actionType === ACTION_TYPES.COMMAND_EXEC && command && !isCommandApproved(command)) {
    choices.splice(1, 0, {
      title: `Approve command "${command}" and allow`,
      value: 'approve_command'
    });
  }
  
  const { permission } = await prompts({
    type: 'select',
    name: 'permission',
    message: 'Do you want to allow this action?',
    choices,
    initial: 0,
    onCancel: () => {
      // Return false to prevent process exit
      return false;
    }
  });
  
  if (permission === PERMISSION_LEVELS.ALLOW_FOREVER) {
    setActionAllowedForever(actionType);
    console.log(chalk.green(`✅ ${actionType} actions are now permanently allowed`));
  } else if (permission === PERMISSION_LEVELS.AUTO_APPROVE) {
    setAutoApprove(actionType);
    console.log(chalk.green(`✅ Auto-approve enabled for ${actionType} actions`));
    return PERMISSION_LEVELS.ALLOW; // Allow this action
  } else if (permission === 'approve_command' && command) {
    addApprovedCommand(command);
    console.log(chalk.green(`✅ Command "${command}" added to approved list`));
    return PERMISSION_LEVELS.ALLOW; // Allow this action
  }
  
  return permission || PERMISSION_LEVELS.DISALLOW;
}

/**
 * Check permission for an action
 * @param {string} actionType - Type of action
 * @param {string} description - Description of the action
 * @param {string} [command] - Command being executed (for command actions)
 * @returns {Promise<boolean>} Whether action is allowed
 */
async function checkPermission(actionType, description, command = null) {
  // Check if action is permanently allowed
  if (isActionAllowedForever(actionType)) {
    return true;
  }
  
  // For command execution with auto-approve enabled
  if (actionType === ACTION_TYPES.COMMAND_EXEC && command && isAutoApproveEnabled(actionType)) {
    if (isCommandApproved(command)) {
      console.log(chalk.green(`✅ Auto-approved command: ${command}`));
      return true;
    }
  }
  
  // Prompt for permission
  const permission = await promptForPermission(actionType, description, command);
  return permission === PERMISSION_LEVELS.ALLOW || permission === PERMISSION_LEVELS.ALLOW_FOREVER;
}

/**
 * Read a file with permission check
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} File contents
 */
export async function readFile(filePath) {
  const allowed = await checkPermission(
    ACTION_TYPES.FILE_READ,
    `Read file: ${filePath}`
  );
  
  if (!allowed) {
    throw new Error('Permission denied: File read operation not allowed');
  }
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    console.log(chalk.green(`✅ Read file: ${filePath}`));
    return content;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Write to a file with permission check
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
export async function writeFile(filePath, content) {
  const allowed = await checkPermission(
    ACTION_TYPES.FILE_WRITE,
    `Write to file: ${filePath}`
  );
  
  if (!allowed) {
    throw new Error('Permission denied: File write operation not allowed');
  }
  
  try {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(chalk.green(`✅ Wrote to file: ${filePath}`));
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Delete a file with permission check
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
  const allowed = await checkPermission(
    ACTION_TYPES.FILE_DELETE,
    `Delete file: ${filePath}`
  );
  
  if (!allowed) {
    throw new Error('Permission denied: File delete operation not allowed');
  }
  
  try {
    await fs.unlink(filePath);
    console.log(chalk.green(`✅ Deleted file: ${filePath}`));
  } catch (error) {
    throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
  }
}

/**
 * Execute a command with permission check
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @param {Function} onOutput - Optional callback for streaming output
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export async function executeCommand(command, options = {}, onOutput = null) {
  const allowed = await checkPermission(
    ACTION_TYPES.COMMAND_EXEC,
    `Execute command: ${command}`,
    command
  );
  
  if (!allowed) {
    throw new Error('Permission denied: Command execution not allowed');
  }
  
  try {
    console.log(chalk.blue(`🔧 Executing: ${command}`));
    
    // If streaming callback is provided, use spawn for real-time output
    if (onOutput && typeof onOutput === 'function') {
      return await executeCommandStreaming(command, options, onOutput);
    }
    
    // Otherwise use the original exec method
    const result = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 30000, // 30 second timeout
      ...options
    });
    
    console.log(chalk.green(`✅ Command completed successfully`));
    if (result.stdout) {
      console.log(chalk.gray('Output:'));
      console.log(result.stdout);
    }
    if (result.stderr) {
      console.log(chalk.yellow('Warnings:'));
      console.log(result.stderr);
    }
    
    return result;
  } catch (error) {
    console.error(chalk.red(`❌ Command failed: ${error.message}`));
    throw new Error(`Command execution failed: ${error.message}`);
  }
}

/**
 * Execute a command with streaming output
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @param {Function} onOutput - Callback for streaming output
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function executeCommandStreaming(command, options, onOutput) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd: options.cwd || process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    // Stream stdout
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      onOutput('stdout', chunk);
    });
    
    // Stream stderr
    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      onOutput('stderr', chunk);
    });
    
    // Handle completion
    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ Command completed successfully`));
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Command failed with exit code ${code}`);
        console.error(chalk.red(`❌ Command failed: ${error.message}`));
        reject(error);
      }
    });
    
    // Handle errors
    child.on('error', (error) => {
      console.error(chalk.red(`❌ Command error: ${error.message}`));
      reject(error);
    });
    
    // Set timeout
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Command timeout after 30 seconds'));
    }, 30000);
    
    child.on('close', () => clearTimeout(timeout));
  });
}

/**
 * List files in a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<string[]>} List of files
 */
export async function listFiles(dirPath = '.') {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} Whether file exists
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset all permissions
 */
export function resetPermissions() {
  updateConfig('permissions', {});
  console.log(chalk.green('✅ All permissions have been reset'));
}

/**
 * Show current permissions
 */
export function showPermissions() {
  const config = getConfig();
  const permissions = config.permissions || {};
  const approvedCommands = config.approvedCommands || DEFAULT_APPROVED_COMMANDS;
  
  console.log(chalk.blue('\n🔐 Current Permissions:'));
  
  if (Object.keys(permissions).length === 0) {
    console.log(chalk.gray('No permanent permissions set'));
  } else {
    Object.entries(permissions).forEach(([actionType, level]) => {
      let status;
      switch (level) {
        case PERMISSION_LEVELS.ALLOW_FOREVER:
          status = chalk.green('✅ Allowed Forever');
          break;
        case PERMISSION_LEVELS.AUTO_APPROVE:
          status = chalk.cyan('🔄 Auto-Approve Enabled');
          break;
        default:
          status = chalk.gray('Not Set');
      }
      console.log(`${actionType}: ${status}`);
    });
  }
  
  console.log(chalk.blue('\n📋 Approved Commands:'));
  console.log(chalk.gray(`Total: ${approvedCommands.length} commands`));
  
  if (approvedCommands.length <= 10) {
    approvedCommands.forEach(cmd => console.log(chalk.gray(`  • ${cmd}`)));
  } else {
    approvedCommands.slice(0, 10).forEach(cmd => console.log(chalk.gray(`  • ${cmd}`)));
    console.log(chalk.gray(`  ... and ${approvedCommands.length - 10} more`));
  }
}

/**
 * Show approved commands list
 */
export function showApprovedCommands() {
  const approvedCommands = getApprovedCommands();
  
  console.log(chalk.blue('\n📋 Approved Commands:'));
  console.log(chalk.gray(`Total: ${approvedCommands.length} commands\n`));
  
  approvedCommands.forEach((cmd, index) => {
    console.log(chalk.gray(`${(index + 1).toString().padStart(3)}: ${cmd}`));
  });
}

export { ACTION_TYPES, PERMISSION_LEVELS, isCommandApproved };