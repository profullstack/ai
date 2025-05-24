import { getOpenAIKey, getAnthropicKey } from './config.js';

// API endpoints
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Call the appropriate AI provider based on model
 * @param {Array} messages - Chat history messages
 * @param {Object} config - Configuration object
 * @returns {Promise<string>} AI response text
 */
export async function callAI(messages, config) {
  const { model, temperature = 0.7, maxTokens = 1000, verbose = false } = config;
  
  // Determine provider based on model
  if (model.startsWith('gpt-') || model.includes('openai')) {
    return callOpenAI(messages, model, temperature, maxTokens, verbose);
  } else if (model.startsWith('claude-') || model.includes('anthropic')) {
    return callAnthropic(messages, model, temperature, maxTokens, verbose);
  } else {
    // Default to OpenAI for unknown models
    return callOpenAI(messages, model, temperature, maxTokens, verbose);
  }
}

/**
 * Call OpenAI API
 * @param {Array} messages - Chat history messages
 * @param {string} model - OpenAI model to use
 * @param {number} temperature - Response creativity
 * @param {number} maxTokens - Maximum response length
 * @param {boolean} verbose - Whether to log detailed information
 * @returns {Promise<string>} AI response text
 */
async function callOpenAI(messages, model, temperature, maxTokens, verbose) {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Please set it using: ai config --set-openai-key YOUR_KEY'
    );
  }
  
  if (verbose) {
    console.log(`Using OpenAI model: ${model}`);
  }
  
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error.message.includes('fetch failed')) {
      throw new Error('Failed to connect to OpenAI API. Please check your internet connection.');
    }
    throw error;
  }
}

/**
 * Call Anthropic API
 * @param {Array} messages - Chat history messages
 * @param {string} model - Anthropic model to use
 * @param {number} temperature - Response creativity
 * @param {number} maxTokens - Maximum response length
 * @param {boolean} verbose - Whether to log detailed information
 * @returns {Promise<string>} AI response text
 */
async function callAnthropic(messages, model, temperature, maxTokens, verbose) {
  const apiKey = getAnthropicKey();
  
  if (!apiKey) {
    throw new Error(
      'Anthropic API key not found. Please set it using: ai config --set-anthropic-key YOUR_KEY'
    );
  }
  
  if (verbose) {
    console.log(`Using Anthropic model: ${model}`);
  }
  
  // Convert messages format for Anthropic API
  const systemMessage = messages.find(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  try {
    const requestBody = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: conversationMessages,
    };
    
    // Add system message if present
    if (systemMessage) {
      requestBody.system = systemMessage.content;
    }
    
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }
    
    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    if (error.message.includes('fetch failed')) {
      throw new Error('Failed to connect to Anthropic API. Please check your internet connection.');
    }
    throw error;
  }
}