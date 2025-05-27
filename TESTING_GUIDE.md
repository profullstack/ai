# Testing Guide for Enhanced AI Agent

## Installation & Setup

```bash
# Install the package globally
npm install -g @profullstack/ai

# Or with pnpm
pnpm add -g @profullstack/ai

# Run initial setup
ai setup
```

## Testing Enhanced Mode Features

### 1. Basic Enhanced Mode Test

```bash
# Start enhanced mode (default)
ai

# Or explicitly enable enhanced mode
ai --enhanced
```

**Test Commands:**
```
ai > help
# Should show enhanced features in help

ai > list the files in the current directory
# AI should respond with: ACTION:LIST_FILES:.
# You'll be prompted for permission

ai > read the package.json file
# AI should respond with: ACTION:READ_FILE:package.json
# You'll see the file content in chat
```

### 2. Permission System Testing

```bash
# Check current permissions
ai config --show-permissions

# View approved commands (should show 38+ commands)
ai config --show-commands

# Add a custom approved command
ai config --add-command "echo hello"

# Test auto-approve workflow
ai ask "run ls command to list files"
# Choose "[x] Auto-approve" when prompted
# Then try: ai ask "run pwd command"
# Should auto-approve since pwd is in approved list
```

### 3. File Operations Testing

Create a test file first:
```bash
echo "function test() { return 'hello'; }" > test.js
```

**Test file operations:**
```bash
# Test file reading
ai ask "read the test.js file and tell me what it does"

# Test file modification with diff
ai ask "add a new function called greet() to test.js that takes a name parameter"
# AI should use ACTION:DIFF_FILE with search/replace blocks

# Test file writing (traditional)
ai ask "create a new file called hello.txt with a greeting message"
```

### 4. Command Execution Testing

```bash
# Test quick commands (batch execution)
ai ask "show me the current directory"
ai ask "list all files with details"

# Test long-running commands (streaming)
ai ask "run npm list to show dependencies"
# Should show streaming output for longer commands

# Test with working directory
ai ask "run ls in the examples directory"
```

### 5. Diff-Based File Modification Testing

Create a more complex test file:
```bash
cat > calculator.js << 'EOF'
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export { add, subtract };
EOF
```

**Test diff operations:**
```bash
ai ask "add a multiply function to calculator.js"
# Should use ACTION:DIFF_FILE with precise changes

ai ask "preview adding a divide function to calculator.js without applying the changes"
# Should use ACTION:PREVIEW_DIFF

ai ask "add both multiply and divide functions to calculator.js in one operation"
# Should show multiple diff blocks
```

### 6. Advanced Testing Scenarios

**Test streaming vs batch detection:**
```bash
ai ask "run echo 'test1' && sleep 2 && echo 'test2'"
# Should detect as long-running and stream output

ai ask "show current working directory"
# Should use batch execution for quick pwd command
```

**Test permission persistence:**
```bash
# Set auto-approve for commands
ai ask "run ls command"
# Choose "[x] Auto-approve"

# Test that it remembers
ai ask "run pwd command"
# Should auto-approve without prompting

# Reset permissions
ai config --reset-permissions
```

**Test error handling:**
```bash
ai ask "read a file that doesn't exist"
# Should show permission prompt then error message

ai ask "run an invalid command like 'invalidcommand123'"
# Should show permission prompt then command error
```

## Expected Behaviors

### ✅ Enhanced Mode Indicators
- Help shows enhanced features
- Permission prompts have 4 options including "[x] Auto-approve"
- Command approval status shown in prompts
- Rich formatted output for all operations

### ✅ File Operations
- **Read**: Shows file size, line count, and formatted content
- **Write**: Shows size, preview, and confirmation
- **Diff**: Shows changes applied, size changes, and modification summary
- **Preview**: Shows diff without applying changes

### ✅ Command Execution
- **Quick commands**: Immediate results with formatted output
- **Long-running**: Streaming output with progress indication
- **Auto-approval**: Approved commands execute without prompts

### ✅ Permission System
- **Granular control**: Separate permissions for different action types
- **Persistence**: Settings saved in ~/.config/ai/config.json
- **Transparency**: Clear indication of approval status

## Troubleshooting

### Text-Only Mode (Fallback)
```bash
# If you want to disable enhanced features
ai --no-enhanced

# Or check if enhanced mode is working
ai config --show-permissions
# Should show permissions and approved commands
```

### Permission Issues
```bash
# Reset all permissions
ai config --reset-permissions

# Reset approved commands
ai config --reset-commands

# Check configuration
ai config --show
```

### API Key Setup
```bash
# Set up API keys if not done
ai setup

# Check API key status
ai config --show-keys
```

## Example Test Session

```bash
# 1. Start enhanced mode
ai

# 2. Test basic functionality
ai > help
ai > list files in current directory

# 3. Choose "[x] Auto-approve" for command_exec

# 4. Test file operations
ai > read package.json and summarize this project

# 5. Test diff modification
ai > add a comment at the top of package.json explaining what this project does

# 6. Test streaming
ai > run npm list --depth=0

# 7. Exit
ai > exit
```

This comprehensive testing will verify all enhanced features are working correctly!