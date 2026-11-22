/**
 * Logic for Page 8: AI Career Chatbot
 * Supports multi-turn conversation memory via /api/gemini and quick starter prompts.
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const starterChips = document.querySelectorAll('.chip-btn');
  
    // Stores alternating { role: 'user' | 'model', text: '...' } turns
    let conversationHistory = [];
  
    const systemInstruction =
      'You are a friendly, encouraging, and practical AI Career Mentor for college students, fresh graduates, and entry-level job seekers. ' +
      'Give concrete, step-by-step career advice covering resumes, portfolios, internships, networking, LinkedIn, and interviews. ' +
      'Keep responses well-structured, concise, and actionable.';
  
    // Helper: Safely append a message bubble to the chat window
    function appendMessage(sender, text) {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${sender === 'user' ? 'user' : 'bot'}`;
  
      const meta = document.createElement('span');
      meta.className = 'chat-meta';
      meta.textContent = sender === 'user' ? 'You' : 'Gemini Career Mentor';
  
      const body = document.createElement('div');
      body.textContent = text;
  
      bubble.appendChild(meta);
      bubble.appendChild(body);
      chatWindow.appendChild(bubble);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  
    // Send a message to Gemini with conversation history
    async function sendChatMessage(messageText) {
      const trimmed = messageText.trim();
      if (!trimmed) return;
  
      appendMessage('user', trimmed);
      chatInput.value = '';
  
      try {
        CareerAI.setUIState({
          loaderId: 'chatLoader',
          errorId: 'chatError',
          buttonId: 'chatSendBtn',
          isLoading: true
        });
  
        // Pass last 10 turns so Gemini maintains multi-turn context without exceeding payload size
        const recentHistory = conversationHistory.slice(-10);
  
        const reply = await CareerAI.generate({
          prompt: trimmed,
          systemInstruction,
          history: recentHistory,
          toolName: 'AI Career Chatbot'
        });
  
        appendMessage('bot', reply);
  
        // Update conversation memory
        conversationHistory.push({ role: 'user', text: trimmed });
        conversationHistory.push({ role: 'model', text: reply });
      } catch (err) {
        CareerAI.setUIState({
          loaderId: 'chatLoader',
          errorId: 'chatError',
          buttonId: 'chatSendBtn',
          isLoading: false,
          errorMessage: err.message
        });
        return;
      }
  
      CareerAI.setUIState({
        loaderId: 'chatLoader',
        errorId: 'chatError',
        buttonId: 'chatSendBtn',
        isLoading: false
      });
    }
  
    // Handle form submit
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendChatMessage(chatInput.value);
      });
    }
  
    // Handle starter prompt chips
    starterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) {
          sendChatMessage(prompt);
        }
      });
    });
  
    // Reset conversation
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        conversationHistory = [];
        chatWindow.innerHTML = '';
        appendMessage(
          'bot',
          'Conversation cleared! Ask me any new question about resumes, internships, or interviews.'
        );
        CareerAI.setUIState({
          loaderId: 'chatLoader',
          errorId: 'chatError',
          buttonId: 'chatSendBtn',
          isLoading: false
        });
      });
    }
  });