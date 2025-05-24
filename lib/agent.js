import { getConfig } from './config.js';

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
      // For now, we'll simulate an AI response
      // In a real implementation, this would call an actual AI API
      const response = await this.generateResponse(message);
      
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

  async generateResponse(message) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    // Simple response generation for demonstration
    // In a real implementation, this would call OpenAI, Anthropic, or another AI service
    const responses = [
      `I understand you're asking about "${message}". Let me help you with that.`,
      `That's an interesting question about "${message}". Here's what I think...`,
      `Regarding "${message}", I can provide some insights.`,
      `Let me address your question about "${message}".`,
      `I'd be happy to help you with "${message}".`
    ];

    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add some context-aware responses
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return 'Hello! I\'m your AI assistant. How can I help you today?';
    }
    
    if (message.toLowerCase().includes('how are you')) {
      return 'I\'m doing well, thank you for asking! I\'m here and ready to help you with any questions or tasks you have.';
    }
    
    if (message.toLowerCase().includes('what can you do')) {
      return 'I can help you with a wide variety of tasks including:\n' +
             '• Answering questions on various topics\n' +
             '• Helping with writing and editing\n' +
             '• Explaining concepts and ideas\n' +
             '• Providing suggestions and recommendations\n' +
             '• Assisting with problem-solving\n' +
             '• And much more! Just ask me anything you\'d like help with.';
    }
    
    if (message.toLowerCase().includes('time') || message.toLowerCase().includes('date')) {
      return `The current time is ${new Date().toLocaleString()}. Is there something specific about time or dates you'd like to know?`;
    }

    // For other messages, provide a helpful but generic response
    return `${baseResponse}\n\nI'm a demonstration AI agent. In a full implementation, I would connect to a real AI service like OpenAI's GPT or Anthropic's Claude to provide more sophisticated responses. For now, I can engage in basic conversation and demonstrate the interactive CLI interface.`;
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