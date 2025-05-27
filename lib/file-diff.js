import { readFile, writeFile } from './actions.js';
import chalk from 'chalk';

/**
 * Apply a diff-style modification to a file
 * @param {string} filePath - Path to file
 * @param {string} diffContent - Diff content with markers
 * @returns {Promise<string>} Result description
 */
export async function applyFileDiff(filePath, diffContent) {
  // Read current file content
  const currentContent = await readFile(filePath);
  const lines = currentContent.split('\n');
  
  // Parse diff blocks
  const diffBlocks = parseDiffBlocks(diffContent);
  
  let modifiedLines = [...lines];
  let totalChanges = 0;
  
  // Apply diff blocks in reverse order to maintain line numbers
  for (const block of diffBlocks.reverse()) {
    const result = applyDiffBlock(modifiedLines, block);
    modifiedLines = result.lines;
    totalChanges += result.changes;
  }
  
  // Write modified content back
  const newContent = modifiedLines.join('\n');
  await writeFile(filePath, newContent);
  
  return formatDiffResult(filePath, diffBlocks, totalChanges, currentContent.length, newContent.length);
}

/**
 * Parse diff blocks from content
 * @param {string} diffContent - Raw diff content
 * @returns {Array} Parsed diff blocks
 */
function parseDiffBlocks(diffContent) {
  const blocks = [];
  const diffRegex = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;
  
  let match;
  while ((match = diffRegex.exec(diffContent)) !== null) {
    blocks.push({
      search: match[1],
      replace: match[2],
      type: 'replace'
    });
  }
  
  // Also support INSERT blocks
  const insertRegex = /<<<<<<< INSERT_AFTER\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> INSERT/g;
  
  while ((match = insertRegex.exec(diffContent)) !== null) {
    blocks.push({
      search: match[1],
      insert: match[2],
      type: 'insert'
    });
  }
  
  return blocks;
}

/**
 * Apply a single diff block to lines
 * @param {Array} lines - File lines
 * @param {Object} block - Diff block
 * @returns {Object} Result with modified lines and change count
 */
function applyDiffBlock(lines, block) {
  if (block.type === 'replace') {
    return applyReplaceBlock(lines, block);
  } else if (block.type === 'insert') {
    return applyInsertBlock(lines, block);
  }
  
  return { lines, changes: 0 };
}

/**
 * Apply a replace diff block
 * @param {Array} lines - File lines
 * @param {Object} block - Replace block
 * @returns {Object} Result with modified lines and change count
 */
function applyReplaceBlock(lines, block) {
  const searchLines = block.search.split('\n');
  const replaceLines = block.replace.split('\n');
  
  // Find the search pattern in the file
  for (let i = 0; i <= lines.length - searchLines.length; i++) {
    let match = true;
    
    for (let j = 0; j < searchLines.length; j++) {
      if (lines[i + j].trim() !== searchLines[j].trim()) {
        match = false;
        break;
      }
    }
    
    if (match) {
      // Replace the matched lines
      const newLines = [
        ...lines.slice(0, i),
        ...replaceLines,
        ...lines.slice(i + searchLines.length)
      ];
      
      return {
        lines: newLines,
        changes: Math.max(searchLines.length, replaceLines.length)
      };
    }
  }
  
  throw new Error(`Search pattern not found in file:\n${block.search}`);
}

/**
 * Apply an insert diff block
 * @param {Array} lines - File lines
 * @param {Object} block - Insert block
 * @returns {Object} Result with modified lines and change count
 */
function applyInsertBlock(lines, block) {
  const searchLines = block.search.split('\n');
  const insertLines = block.insert.split('\n');
  
  // Find the search pattern
  for (let i = 0; i <= lines.length - searchLines.length; i++) {
    let match = true;
    
    for (let j = 0; j < searchLines.length; j++) {
      if (lines[i + j].trim() !== searchLines[j].trim()) {
        match = false;
        break;
      }
    }
    
    if (match) {
      // Insert after the matched lines
      const newLines = [
        ...lines.slice(0, i + searchLines.length),
        ...insertLines,
        ...lines.slice(i + searchLines.length)
      ];
      
      return {
        lines: newLines,
        changes: insertLines.length
      };
    }
  }
  
  throw new Error(`Search pattern not found for insertion:\n${block.search}`);
}

/**
 * Format the diff result for display
 * @param {string} filePath - File path
 * @param {Array} blocks - Applied diff blocks
 * @param {number} totalChanges - Total number of changes
 * @param {number} oldSize - Original file size
 * @param {number} newSize - New file size
 * @returns {string} Formatted result
 */
function formatDiffResult(filePath, blocks, totalChanges, oldSize, newSize) {
  const sizeDiff = newSize - oldSize;
  const sizeChange = sizeDiff > 0 ? `+${sizeDiff}` : sizeDiff.toString();
  
  let result = `**File modified:** \`${filePath}\`\n`;
  result += `**Changes applied:** ${blocks.length} diff blocks, ${totalChanges} lines modified\n`;
  result += `**Size change:** ${sizeChange} characters (${oldSize} → ${newSize})\n\n`;
  
  result += `**Applied changes:**\n`;
  blocks.forEach((block, index) => {
    result += `${index + 1}. ${block.type === 'replace' ? 'Replaced' : 'Inserted'} ${block.type === 'replace' ? block.search.split('\n').length : block.insert.split('\n').length} lines\n`;
  });
  
  return result;
}

/**
 * Create a diff preview without applying changes
 * @param {string} filePath - Path to file
 * @param {string} diffContent - Diff content
 * @returns {Promise<string>} Diff preview
 */
export async function previewFileDiff(filePath, diffContent) {
  try {
    const currentContent = await readFile(filePath);
    const lines = currentContent.split('\n');
    const diffBlocks = parseDiffBlocks(diffContent);
    
    let preview = `**Diff preview for:** \`${filePath}\`\n\n`;
    
    diffBlocks.forEach((block, index) => {
      preview += `**Change ${index + 1}:**\n`;
      if (block.type === 'replace') {
        preview += `\`\`\`diff\n- ${block.search.split('\n').join('\n- ')}\n+ ${block.replace.split('\n').join('\n+ ')}\n\`\`\`\n\n`;
      } else if (block.type === 'insert') {
        preview += `\`\`\`diff\n  ${block.search.split('\n').join('\n  ')}\n+ ${block.insert.split('\n').join('\n+ ')}\n\`\`\`\n\n`;
      }
    });
    
    return preview;
  } catch (error) {
    return `**Error creating diff preview:** ${error.message}`;
  }
}