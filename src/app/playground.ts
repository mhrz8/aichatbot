const PLAYGROUND_CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 800px;
  height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-header h1 {
  font-size: 24px;
  margin-bottom: 5px;
}

.chat-header p {
  opacity: 0.9;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.message {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #4facfe;
}

.message.assistant .message-avatar {
  background: #764ba2;
}

.message-content {
  background: white;
  padding: 15px;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 70%;
  line-height: 1.5;
}

.message.user .message-content {
  background: #4facfe;
  color: white;
}

.message-info {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.message.user .message-info {
  color: rgba(255, 255, 255, 0.8);
}

.tools-used {
  margin-top: 10px;
  padding: 8px 12px;
  background: #e8f4f8;
  border-radius: 12px;
  font-size: 12px;
  color: #2c5aa0;
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-field {
  flex: 1;
  min-height: 50px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  resize: none;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #4facfe;
}

.input-field:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.send-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: transform 0.2s, opacity 0.2s;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  background: #ccc;
}

.thinking-bubble {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.thinking-content {
  background: white;
  padding: 15px;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 70%;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-style: italic;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  background: #764ba2;
  border-radius: 50%;
  animation: thinking 1.4s infinite;
}

.thinking-dot:nth-child(1) { animation-delay: 0s; }
.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes thinking {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-8px); opacity: 1; }
}

.suggestions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.suggestion {
  background: #e8f4f8;
  color: #2c5aa0;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.suggestion:hover:not(:disabled) {
  background: #2c5aa0;
  color: white;
}

.suggestion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
  transition: all 0.2s;
}

.reset-button:hover:not(:disabled) {
  background: #ff5252;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.streaming-text {
  min-height: 1.5em;
}

.cursor::after {
  content: '|';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Smooth animations for message appearance */
.message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
      opacity: 0;
      transform: translateY(20px);
  }
  to {
      opacity: 1;
      transform: translateY(0);
  }
}

/* Loading state for send button */
.send-button.loading {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
`;

const PLAYGROUND_JS = `
class ChatPlayground {
    constructor() {
        this.chatHistory = [];
        this.isProcessing = false;
        this.currentReader = null;
        this.currentAssistantBubble = null;
        this.assistantContent = '';
        
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.initializeEventListeners();
        this.messageInput.focus();
    }
    
    initializeEventListeners() {
        // Handle window close/reload to cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Handle input changes for button state
        this.messageInput.addEventListener('input', () => {
            this.updateSendButtonState();
        });
    }
    
    updateSendButtonState() {
        const hasText = this.messageInput.value.trim().length > 0;
        const canSend = hasText && !this.isProcessing;
        
        this.sendButton.disabled = !canSend;
        
        if (this.isProcessing) {
            this.sendButton.classList.add('loading');
            this.sendButton.innerHTML = '⏳';
        } else {
            this.sendButton.classList.remove('loading');
            this.sendButton.innerHTML = '➤';
        }
    }
    
    disableAllInputs() {
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        
        // Disable all suggestion buttons
        const suggestions = document.querySelectorAll('.suggestion, .reset-button');
        suggestions.forEach(btn => btn.disabled = true);
    }
    
    enableAllInputs() {
        this.messageInput.disabled = false;
        this.updateSendButtonState();
        
        // Enable all suggestion buttons
        const suggestions = document.querySelectorAll('.suggestion, .reset-button');
        suggestions.forEach(btn => btn.disabled = false);
    }
    
    addMessage(content, isUser = false, toolsUsed = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = \`message \${isUser ? 'user' : 'assistant'}\`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? '👤' : '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content.replace(/\\n/g, '<br>');
        
        if (toolsUsed.length > 0) {
            const toolsDiv = document.createElement('div');
            toolsDiv.className = 'tools-used';
            toolsDiv.textContent = \`🛠️ Used tools: \${toolsUsed.join(', ')}\`;
            contentDiv.appendChild(toolsDiv);
        }
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-info';
        timestamp.textContent = new Date().toLocaleTimeString();
        contentDiv.appendChild(timestamp);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    createStreamingBubble() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        messageDiv.id = 'streamingBubble';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = \`
            <div class="streaming-text cursor"></div>
            <div class="message-info">\${new Date().toLocaleTimeString()}</div>
        \`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    updateStreamingBubble(content) {
        if (!this.currentAssistantBubble) return;
        
        const streamingTextDiv = this.currentAssistantBubble.querySelector('.streaming-text');
        if (streamingTextDiv) {
            const formattedContent = content.replace(/\\n/g, '<br>');
            streamingTextDiv.innerHTML = formattedContent;
            this.scrollToBottom();
        }
    }
    
    finalizeStreamingBubble() {
        if (!this.currentAssistantBubble) return;
        
        const streamingTextDiv = this.currentAssistantBubble.querySelector('.streaming-text');
        if (streamingTextDiv) {
            // Remove cursor class to stop blinking
            streamingTextDiv.classList.remove('cursor');
            
            // Update timestamp
            const timestampDiv = this.currentAssistantBubble.querySelector('.message-info');
            if (timestampDiv) {
                timestampDiv.textContent = new Date().toLocaleTimeString();
            }
        }
        
        // Remove the streaming bubble ID
        this.currentAssistantBubble.removeAttribute('id');
        this.currentAssistantBubble = null;
    }
    
    showThinkingBubble() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'thinking-bubble';
        thinkingDiv.id = 'thinkingBubble';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.style.background = '#764ba2';
        avatar.textContent = '🤖';
        
        const content = document.createElement('div');
        content.className = 'thinking-content';
        content.innerHTML = \`
            <span>AI is thinking</span>
            <div class="thinking-dots">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
        \`;
        
        thinkingDiv.appendChild(avatar);
        thinkingDiv.appendChild(content);
        this.chatMessages.appendChild(thinkingDiv);
        this.scrollToBottom();
        return thinkingDiv;
    }
    
    hideThinkingBubble() {
        const thinkingBubble = document.getElementById('thinkingBubble');
        if (thinkingBubble) {
            thinkingBubble.remove();
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    cleanup() {
        if (this.currentReader) {
            try {
                this.currentReader.cancel();
                this.currentReader.releaseLock();
            } catch (e) {
                console.log('Reader cleanup error:', e);
            }
            this.currentReader = null;
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isProcessing) return;
        
        // Set processing state
        this.isProcessing = true;
        this.disableAllInputs();
        
        try {
            // Add user message to history and UI
            this.chatHistory.push({
                role: 'user',
                content: [{ text: message }]
            });
            this.addMessage(message, true);
            this.messageInput.value = '';
            
            // Show thinking bubble
            this.showThinkingBubble();
            
            // Start streaming request
            await this.startStreaming(message);
            
        } catch (error) {
            console.error('Send message error:', error);
            this.hideThinkingBubble();
            this.addMessage(\`❌ Connection error: \${error.message}\`, false);
        } finally {
            // Reset processing state
            this.isProcessing = false;
            this.enableAllInputs();
            this.currentAssistantBubble = null;
            this.assistantContent = '';
        }
    }
    
    async startStreaming(message) {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify({
                query: message,
                histories: this.chatHistory.slice(0, -1),
            })
        });
        
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body reader available');
        
        this.currentReader = reader;
        let isFirstText = true;
        let buffer = '';
        const decoder = new TextDecoder();
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('Stream ended');
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                console.log('Raw chunk received:', JSON.stringify(chunk));
                
                buffer += chunk;
                
                // Handle both actual newlines and escaped newlines
                let delimiter = '\\n\\n';
                if (!buffer.includes(delimiter) && buffer.includes('\\\\n\\\\n')) {
                    delimiter = '\\\\n\\\\n';
                }
                
                const lines = buffer.split(delimiter);
                
                // Keep the last potentially incomplete line
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    console.log('Processing line:', JSON.stringify(line));
                    
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.substring(6);
                            console.log('JSON string to parse:', JSON.stringify(jsonStr));
                            
                            const eventData = JSON.parse(jsonStr);
                            console.log('Parsed event:', eventData);
                            
                            await this.handleStreamEvent(eventData, isFirstText);
                            
                            if (eventData.type === 'text' && isFirstText) {
                                isFirstText = false;
                            }
                            
                        } catch (e) {
                            console.error('Failed to parse JSON:', jsonStr, e);
                        }
                    } else {
                        console.log('Skipping non-data line:', JSON.stringify(line));
                    }
                }
            }
        } finally {
            this.currentReader = null;
            reader.releaseLock();
        }
    }

    async handleStreamEvent(eventData, isFirstText) {
        switch (eventData.type) {
            case 'thinking':
                console.log('Thinking event received');
                
                // If we have a current streaming bubble, finalize it first
                if (this.currentAssistantBubble) {
                    this.finalizeStreamingBubble();
                    
                    // Add current content to chat history
                    if (this.assistantContent.trim()) {
                        this.chatHistory.push({
                            role: 'assistant',
                            content: [{ text: this.assistantContent }]
                        });
                    }
                    
                    // Reset for new bubble
                    this.assistantContent = '';
                    this.lastProcessedLength = 0; // Reset length tracker
                }
                
                // Always show thinking bubble when thinking event is received
                this.hideThinkingBubble(); // Remove any existing thinking bubble
                this.showThinkingBubble();
                break;
                
            case 'text':
                console.log('Text event received:', eventData.message);
                
                // Hide thinking bubble and create new streaming bubble for new content
                if (isFirstText || !this.currentAssistantBubble) {
                    console.log('Creating new streaming bubble for text');
                    this.hideThinkingBubble();
                    this.currentAssistantBubble = this.createStreamingBubble();
                    
                    // Reset content and length tracker for new bubble
                    if (isFirstText) {
                        this.assistantContent = '';
                        this.lastProcessedLength = 0;
                    }
                }
                
                const newText = eventData.message || '';
                
                // Handle different types of streaming content
                if (newText.length > this.assistantContent.length) {
                    // This might be a complete message that includes previous content
                    // Check if it starts with our current content
                    if (this.assistantContent && newText.startsWith(this.assistantContent)) {
                        // Replace with the complete message
                        this.assistantContent = newText;
                        console.log('Updated with complete message');
                    } else {
                        // This is new content, append it
                        this.assistantContent += newText;
                        console.log('Appended new content');
                    }
                } else if (newText.length === this.assistantContent.length && newText === this.assistantContent) {
                    // Exact duplicate, skip
                    console.log('Skipping exact duplicate');
                } else {
                    // This is likely an incremental chunk, append it
                    this.assistantContent += newText;
                    console.log('Appended incremental chunk');
                }
                
                console.log('Current content length:', this.assistantContent.length);
                
                // Update the streaming bubble
                this.updateStreamingBubble(this.assistantContent);
                break;
                
            case 'stop':
                console.log('Stop event received');
                
                // Finalize current bubble and add to history
                this.finalizeStreamingBubble();
                
                // Add to chat history if there's content
                if (this.assistantContent.trim()) {
                    this.chatHistory.push({
                        role: 'assistant',
                        content: [{ text: this.assistantContent }]
                    });
                }
                
                console.log('Message finalized and added to history');
                break;
                
            case 'error':
                console.log('Error event received:', eventData.message);
                this.hideThinkingBubble();
                this.addMessage(\`❌ Error: \${eventData.message}\`, false);
                break;
        }
    }
    
    sendSuggestion(text) {
        if (this.isProcessing) return;
        this.messageInput.value = text;
        this.sendMessage();
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!this.isProcessing) {
                this.sendMessage();
            }
        }
    }
    
    resetChat() {
        if (this.isProcessing) {
            // If currently processing, cleanup first
            this.cleanup();
            this.isProcessing = false;
            this.enableAllInputs();
        }
        
        this.chatHistory = [];
        this.currentAssistantBubble = null;
        this.assistantContent = '';
        
        const timestamp = new Date().toLocaleTimeString();
        this.chatMessages.innerHTML = \`
            <div class="message assistant">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    Chat reset! I'm ready to help you with a fresh conversation. What can I do for you?
                    <div class="message-info">\${timestamp}</div>
                </div>
            </div>
        \`;
        
        this.messageInput.focus();
    }
}

// Initialize the chat playground
const chatPlayground = new ChatPlayground();

// Global functions for onclick handlers
function sendMessage() {
    chatPlayground.sendMessage();
}

function sendSuggestion(text) {
    chatPlayground.sendSuggestion(text);
}

function handleKeyPress(event) {
    chatPlayground.handleKeyPress(event);
}

function resetChat() {
    chatPlayground.resetChat();
}
`;

export function PlaygroundHTML(title: string, subtitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${PLAYGROUND_CSS}
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h1>✈️ AI Flight Booking Assistant</h1>
            <p>${subtitle}</p>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="message assistant">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    Hi! I'm your AI flight booking assistant. I can help you search for flights, create bookings, and manage your travel plans. Just tell me what you need in plain English!
                    <div class="message-info">Try saying something like: "I want to fly from New York to Los Angeles on March 15th for 2 people"</div>
                </div>
            </div>
        </div>
        
        <div class="chat-input">
            <div class="suggestions">
                <button class="suggestion" onclick="sendSuggestion('I want to book a flight from KUL to SIN on Dec 25th 2025 for 1 person')">Book KUL → SIN</button>
                <button class="suggestion" onclick="sendSuggestion('Search flights from Kuala Lumpur to Penang next Friday')">Search KL → Penang</button>
                <button class="suggestion" onclick="sendSuggestion('I need a round trip ticket from Singapore to Jakarta')">Round trip SIN → CGK</button>
                <button class="reset-button" onclick="resetChat()">Reset Chat</button>
            </div>
            <div class="input-group">
                <textarea 
                    class="input-field" 
                    id="messageInput" 
                    placeholder="Type your message here... (e.g., 'I want to fly to Paris next month for 2 people')"
                    onkeydown="handleKeyPress(event)"
                ></textarea>
                <button class="send-button" id="sendButton" onclick="sendMessage()">
                    ➤
                </button>
            </div>
        </div>
    </div>

    <script>
        ${PLAYGROUND_JS}
    </script>
</body>
</html>`;
}
