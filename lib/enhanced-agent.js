import { AIAgent } from './agent.js';
import { readFile, writeFile, deleteFile, executeCommand, listFiles, fileExists } from './actions.js';
import { applyFileDiff, previewFileDiff } from './file-diff.js';
import chalk from 'chalk';

/**
 * Enhanced AI Agent with code modification and command execution capabilities
 */
export class EnhancedAIAgent extends AIAgent {
  constructor(options = {}) {
    // Don't pass system prompt to super, we'll set it ourselves
    const { system, ...superOptions } = options;
    super(superOptions);
    this.enableActions = options.enableActions !== false; // Default to true
    
    // Enhanced system prompt that includes action capabilities
    // Always use the enhanced system prompt when actions are enabled
    const enhancedSystemPrompt = `You are a helpful AI assistant with the ability to read, write, and modify files, as well as execute commands on the user's system.

IMPORTANT: You MUST use the ACTION syntax below when the user asks you to perform file operations or execute commands. Do not just describe what you would do - actually output the ACTION commands.

When you need to perform file operations or execute commands, you MUST use the following action syntax:

**File Operations:**
- To read a file: \`ACTION:READ_FILE:path/to/file.js\`
- To write a file: \`ACTION:WRITE_FILE:path/to/file.js:CONTENT_START\nfile content here\nCONTENT_END\`
- To modify a file with diff: \`ACTION:DIFF_FILE:path/to/file.js:<<<<<<< SEARCH\nold code\n=======\nnew code\n>>>>>>> REPLACE\`
- To preview diff changes: \`ACTION:PREVIEW_DIFF:path/to/file.js:<<<<<<< SEARCH\nold code\n=======\nnew code\n>>>>>>> REPLACE\`
- To delete a file: \`ACTION:DELETE_FILE:path/to/file.js\`
- To list files: \`ACTION:LIST_FILES:path/to/directory\`

**Command Execution:**
- To execute a command: \`ACTION:EXEC_COMMAND:npm install\`
- To execute with working directory: \`ACTION:EXEC_COMMAND:npm test:WORKDIR:/path/to/project\`

**Configuration Management:**
- To approve a command: \`ACTION:APPROVE_COMMAND:git push\`
- To remove approved command: \`ACTION:REMOVE_COMMAND:rm -rf\`
- To show approved commands: \`ACTION:SHOW_COMMANDS\`
- To show permissions: \`ACTION:SHOW_PERMISSIONS\`
- To reset permissions: \`ACTION:RESET_PERMISSIONS\`

**Important Guidelines:**
1. ALWAYS use ACTION: syntax when the user asks you to read files, execute commands, or perform file operations
2. Do NOT just say "I will read the file" - actually output the ACTION command
3. Be careful with file modifications - ask for confirmation for destructive operations
4. Use relative paths when possible
5. For code modifications, show the changes you're making

**Examples of correct responses:**
- User: "What dependencies does this project have?"
  You: "I'll read the package.json file to check the dependencies. ACTION:READ_FILE:package.json"
  Then after seeing the results, analyze them and suggest: "I can also run the package manager command to show the full dependency tree. ACTION:EXEC_COMMAND:pnpm list" (if pnpm is detected) or "ACTION:EXEC_COMMAND:npm list"
- User: "List the files in this directory"
  You: "I'll list the files for you. ACTION:LIST_FILES:."
- User: "Run npm list"
  You: "I'll execute npm list to show the dependency tree. ACTION:EXEC_COMMAND:npm list"

**Important: After executing actions, analyze the results and provide helpful insights or suggest follow-up actions.**

The user will be prompted to allow/disallow each action with options: "allow", "disallow", "allow forever", or "[x] auto-approve".`;

    // Set the system prompt - prioritize enhanced prompt when actions are enabled
    if (this.enableActions) {
      this.systemPrompt = enhancedSystemPrompt;
    } else {
      this.systemPrompt = options.system || this.config.systemPrompt || enhancedSystemPrompt;
    }
  }

  async query(message) {
    const response = await super.query(message);
    
    if (this.enableActions) {
      return await this.processActions(response);
    }
    
    return response;
  }

  /**
   * Process and execute actions found in AI response
   * @param {string} response - AI response text
   * @returns {Promise<string>} Processed response with action results
   */
  async processActions(response) {
    const actionRegex = /ACTION:([A-Z_]+):([^\n]+)/g;
    let match;
    let processedResponse = response;
    const actionResults = [];

    // Find all actions in the response
    const actions = [];
    while ((match = actionRegex.exec(response)) !== null) {
      actions.push({
        type: match[1],
        params: match[2],
        fullMatch: match[0]
      });
    }

    // Execute actions sequentially
    for (const action of actions) {
      try {
        const result = await this.executeAction(action.type, action.params);
        actionResults.push({
          action: action.fullMatch,
          result: result,
          success: true
        });
        
        // Replace action with result in response
        processedResponse = processedResponse.replace(
          action.fullMatch,
          `${chalk.green('✅ Action completed successfully')}\n\n${result}`
        );
      } catch (error) {
        actionResults.push({
          action: action.fullMatch,
          result: error.message,
          success: false
        });
        
        // Replace action with error in response
        processedResponse = processedResponse.replace(
          action.fullMatch,
          `${action.fullMatch}\n${chalk.red('❌ Action failed: ' + error.message)}`
        );
      }
    }

    return processedResponse;
  }

  /**
   * Execute a specific action
   * @param {string} actionType - Type of action
   * @param {string} params - Action parameters
   * @returns {Promise<string>} Action result
   */
  async executeAction(actionType, params) {
    switch (actionType) {
      case 'READ_FILE':
        return await this.handleReadFile(params);
      
      case 'WRITE_FILE':
        return await this.handleWriteFile(params);
      
      case 'DELETE_FILE':
        return await this.handleDeleteFile(params);
      
      case 'LIST_FILES':
        return await this.handleListFiles(params);
      
      case 'EXEC_COMMAND':
        return await this.handleExecCommand(params);
      
      case 'DIFF_FILE':
        return await this.handleDiffFile(params);
      
      case 'PREVIEW_DIFF':
        return await this.handlePreviewDiff(params);
      
      case 'APPROVE_COMMAND':
        return await this.handleApproveCommand(params);
      
      case 'REMOVE_COMMAND':
        return await this.handleRemoveCommand(params);
      
      case 'SHOW_COMMANDS':
        return await this.handleShowCommands();
      
      case 'SHOW_PERMISSIONS':
        return await this.handleShowPermissions();
      
      case 'RESET_PERMISSIONS':
        return await this.handleResetPermissions();
      
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Handle file read action
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File contents
   */
  async handleReadFile(filePath) {
    const content = await readFile(filePath.trim());
    const lines = content.split('\n').length;
    
    return `**File read:** \`${filePath.trim()}\`\n**Size:** ${content.length} characters, ${lines} lines\n\n\`\`\`\n${content}\n\`\`\``;
  }

  /**
   * Handle file write action
   * @param {string} params - Parameters containing file path and content
   * @returns {Promise<string>} Success message
   */
  async handleWriteFile(params) {
    const contentStartIndex = params.indexOf(':CONTENT_START\n');
    const contentEndIndex = params.lastIndexOf('\nCONTENT_END');
    
    if (contentStartIndex === -1 || contentEndIndex === -1) {
      throw new Error('Invalid WRITE_FILE format. Use: path:CONTENT_START\\ncontent\\nCONTENT_END');
    }
    
    const filePath = params.substring(0, contentStartIndex).trim();
    const content = params.substring(contentStartIndex + 15, contentEndIndex); // 15 = length of ':CONTENT_START\n'
    
    await writeFile(filePath, content);
    const lines = content.split('\n').length;
    
    return `**File written:** \`${filePath}\`\n**Size:** ${content.length} characters, ${lines} lines\n\n*Content preview:*\n\`\`\`\n${content.length > 200 ? content.substring(0, 200) + '...' : content}\n\`\`\``;
  }

  /**
   * Handle file delete action
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} Success message
   */
  async handleDeleteFile(filePath) {
    await deleteFile(filePath.trim());
    return `**File deleted:** \`${filePath.trim()}\`\n\n*The file has been permanently removed from the filesystem.*`;
  }

  /**
   * Handle list files action
   * @param {string} dirPath - Directory path
   * @returns {Promise<string>} List of files
   */
  async handleListFiles(dirPath) {
    const files = await listFiles(dirPath.trim() || '.');
    const path = dirPath.trim() || '.';
    
    return `**Directory listing:** \`${path}\`\n**Files found:** ${files.length}\n\n${files.map(f => `• ${f}`).join('\n')}`;
  }

  /**
   * Handle command execution action
   * @param {string} params - Command and optional working directory
   * @returns {Promise<string>} Command output
   */
  async handleExecCommand(params) {
    const workdirIndex = params.indexOf(':WORKDIR:');
    let command, workdir;
    
    if (workdirIndex !== -1) {
      command = params.substring(0, workdirIndex).trim();
      workdir = params.substring(workdirIndex + 9).trim(); // 9 = length of ':WORKDIR:'
    } else {
      command = params.trim();
      workdir = process.cwd();
    }
    
    // Check if this is a potentially long-running command
    const longRunningCommands = ['npm install', 'npm test', 'npm run', 'git clone', 'wget', 'curl', 'ping', 'sleep'];
    const isLongRunning = longRunningCommands.some(cmd => command.toLowerCase().startsWith(cmd));
    
    let output = `**Command executed:** \`${command}\`\n`;
    
    if (workdir && workdir !== process.cwd()) {
      output += `**Working directory:** \`${workdir}\`\n`;
    }
    
    if (isLongRunning) {
      output += '\n*Streaming output:*\n\n';
      
      // Use streaming for long-running commands
      let streamOutput = '';
      const result = await executeCommand(command, { cwd: workdir }, (type, chunk) => {
        // In a real implementation, this would stream to the chat interface
        // For now, we'll collect it and display at the end
        streamOutput += chunk;
        
        // In the future, this could trigger real-time updates to the chat
        console.log(chalk.gray(`[${type}] ${chunk.trim()}`));
      });
      
      if (streamOutput.trim()) {
        output += `\`\`\`\n${streamOutput.trim()}\n\`\`\``;
      }
      
      if (result.stderr && result.stderr.trim()) {
        output += `\n**Warnings:**\n\`\`\`\n${result.stderr.trim()}\n\`\`\``;
      }
    } else {
      // Use regular execution for quick commands
      const result = await executeCommand(command, { cwd: workdir });
      
      if (result.stdout && result.stdout.trim()) {
        output += `\n**Output:**\n\`\`\`\n${result.stdout.trim()}\n\`\`\``;
      }
      
      if (result.stderr && result.stderr.trim()) {
        output += `\n**Warnings:**\n\`\`\`\n${result.stderr.trim()}\n\`\`\``;
      }
      
      if (!result.stdout?.trim() && !result.stderr?.trim()) {
        output += '\n*Command completed successfully (no output)*';
      }
    }
    
    return output;
  }

  /**
   * Handle file diff action
   * @param {string} params - Parameters containing file path and diff content
   * @returns {Promise<string>} Diff result
   */
  async handleDiffFile(params) {
    const colonIndex = params.indexOf(':');
    if (colonIndex === -1) {
      throw new Error('Invalid DIFF_FILE format. Use: path:diff_content');
    }
    
    const filePath = params.substring(0, colonIndex).trim();
    const diffContent = params.substring(colonIndex + 1);
    
    const result = await applyFileDiff(filePath, diffContent);
    return result;
  }

  /**
   * Handle diff preview action
   * @param {string} params - Parameters containing file path and diff content
   * @returns {Promise<string>} Diff preview
   */
  async handlePreviewDiff(params) {
    const colonIndex = params.indexOf(':');
    if (colonIndex === -1) {
      throw new Error('Invalid PREVIEW_DIFF format. Use: path:diff_content');
    }
    
    const filePath = params.substring(0, colonIndex).trim();
    const diffContent = params.substring(colonIndex + 1);
    
    const result = await previewFileDiff(filePath, diffContent);
    return result;
  }

  /**
   * Handle approve command action
   * @param {string} command - Command to approve
   * @returns {Promise<string>} Result message
   */
  async handleApproveCommand(command) {
    const { addApprovedCommand } = await import('./actions.js');
    addApprovedCommand(command.trim());
    return `**Command approved:** \`${command.trim()}\`\n\nThis command has been added to your approved commands list and will be auto-approved in future executions when auto-approve mode is enabled.`;
  }

  /**
   * Handle remove command action
   * @param {string} command - Command to remove
   * @returns {Promise<string>} Result message
   */
  async handleRemoveCommand(command) {
    const { removeApprovedCommand } = await import('./actions.js');
    removeApprovedCommand(command.trim());
    return `**Command removed:** \`${command.trim()}\`\n\nThis command has been removed from your approved commands list and will now require permission prompts.`;
  }

  /**
   * Handle show commands action
   * @returns {Promise<string>} Commands list
   */
  async handleShowCommands() {
    const { getApprovedCommands } = await import('./actions.js');
    const commands = getApprovedCommands();
    
    let result = `**Approved Commands:** ${commands.length} total\n\n`;
    
    if (commands.length <= 20) {
      commands.forEach((cmd, index) => {
        result += `${(index + 1).toString().padStart(2)}: \`${cmd}\`\n`;
      });
    } else {
      commands.slice(0, 15).forEach((cmd, index) => {
        result += `${(index + 1).toString().padStart(2)}: \`${cmd}\`\n`;
      });
      result += `\n*... and ${commands.length - 15} more commands*\n`;
      result += `\nUse \`ai config --show-commands\` to see the complete list.`;
    }
    
    return result;
  }

  /**
   * Handle show permissions action
   * @returns {Promise<string>} Permissions status
   */
  async handleShowPermissions() {
    const { getConfig } = await import('./config.js');
    const { getApprovedCommands, PERMISSION_LEVELS } = await import('./actions.js');
    
    const config = getConfig();
    const permissions = config.permissions || {};
    const approvedCommands = getApprovedCommands();
    
    let result = `**Current Permissions:**\n\n`;
    
    if (Object.keys(permissions).length === 0) {
      result += '*No permanent permissions set*\n\n';
    } else {
      Object.entries(permissions).forEach(([actionType, level]) => {
        let status;
        switch (level) {
          case PERMISSION_LEVELS.ALLOW_FOREVER:
            status = '✅ Allowed Forever';
            break;
          case PERMISSION_LEVELS.AUTO_APPROVE:
            status = '🔄 Auto-Approve Enabled';
            break;
          default:
            status = '❓ Unknown';
        }
        result += `**${actionType}**: ${status}\n`;
      });
      result += '\n';
    }
    
    result += `**Approved Commands:** ${approvedCommands.length} commands\n`;
    result += `*Use ACTION:SHOW_COMMANDS to see the full list*`;
    
    return result;
  }

  /**
   * Handle reset permissions action
   * @returns {Promise<string>} Result message
   */
  async handleResetPermissions() {
    const { resetPermissions } = await import('./actions.js');
    resetPermissions();
    return `**Permissions Reset** ✅\n\nAll action permissions have been cleared. You will be prompted for permission on future file operations and command executions.\n\n*Note: Approved commands list remains unchanged. Use ACTION:RESET_COMMANDS if you want to reset those too.*`;
  }

  /**
   * Enable or disable action processing
   * @param {boolean} enabled - Whether to enable actions
   */
  setActionsEnabled(enabled) {
    this.enableActions = enabled;
    if (this.verbose) {
      console.log(`Actions ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get action processing status
   * @returns {boolean} Whether actions are enabled
   */
  getActionsEnabled() {
    return this.enableActions;
  }
}