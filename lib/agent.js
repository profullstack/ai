import { getConfig } from './config.js';
import { callAI } from './ai-providers.js';

export class AIAgent {
  constructor(options = {}) {
    this.config = getConfig();
    this.model = options.model || this.config.model || 'gpt-3.5-turbo';
    this.temperature = parseFloat(options.temperature || this.config.temperature || 0.7);
    this.maxTokens = parseInt(options.maxTokens || this.config.maxTokens || 1000);
    this.systemPrompt = options.system || this.config.systemPrompt || 'You are a helpful AI assistant.';
    this.verbose = options.verbose || this.config.verbose || false;
    this.conversationHistory = [];
    
    if (this.verbose) {
      console.log(`Initialized AI Agent with model: ${this.model}`);
    }
  }

  async query(message) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    try {
      // Prepare messages for AI API
      const messages = this.buildMessageHistory();
      
      // Call the AI API
      const response = await callAI(messages, {
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        verbose: this.verbose
      });
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      throw new Error(`AI query failed: ${error.message}`);
    }
  }

  buildMessageHistory() {
    // Build message array for AI API
    const messages = [];
    
    // Add system prompt
    messages.push({
      role: 'system',
      content: this.systemPrompt
    });
    
    // Add conversation history (without timestamps for API)
    for (const msg of this.conversationHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }
    
    return messages;
  }

  clearHistory() {
    this.conversationHistory = [];
    if (this.verbose) {
      console.log('Conversation history cleared');
    }
  }

  getHistory() {
    return this.conversationHistory;
  }

  getStats() {
    return {
      totalMessages: this.conversationHistory.length,
      userMessages: this.conversationHistory.filter(msg => msg.role === 'user').length,
      assistantMessages: this.conversationHistory.filter(msg => msg.role === 'assistant').length,
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens
    };
  }

  exportHistory(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.conversationHistory, null, 2);
      case 'text':
        return this.conversationHistory
          .map(msg => `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`)
          .join('\n\n');
      case 'markdown':
        return this.conversationHistory
          .map(msg => {
            const role = msg.role === 'user' ? '**User**' : '**Assistant**';
            return `${role} (${msg.timestamp}):\n${msg.content}`;
          })
          .join('\n\n---\n\n');
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}