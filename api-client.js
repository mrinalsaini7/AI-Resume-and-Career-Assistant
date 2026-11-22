/**
 * Reusable Frontend Client for communicating with /api/gemini
 * Provides centralized validation, error parsing, and activity logging.
 */

const CareerAI = {
    /**
     * Sends a prompt to the secure backend proxy.
     * @param {Object} params
     * @param {string} params.prompt - User prompt text
     * @param {string} [params.systemInstruction] - Role/behavior instructions for Gemini
     * @param {Array} [params.history] - Optional conversation history for chatbot
     * @param {string} [params.toolName] - Module name for dashboard tracking
     * @returns {Promise<string>} - AI generated text
     */
    async generate({ prompt, systemInstruction = '', history = [], toolName = 'General' }) {
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Please enter the required text before submitting.');
      }
  
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          systemInstruction,
          history
        })
      });
  
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid server response. Make sure the serverless API environment is running.');
      }
  
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
  
      this.logActivity(toolName);
      return data.reply;
    },
  
    /**
     * Records tool usage in localStorage so the Dashboard displays real user progress.
     */
    logActivity(toolName) {
      try {
        const raw = localStorage.getItem('career_ai_activity');
        const activity = raw ? JSON.parse(raw) : { totalRuns: 0, recent: [] };
        activity.totalRuns += 1;
        activity.recent.unshift({
          tool: toolName,
          timestamp: new Date().toLocaleString()
        });
        activity.recent = activity.recent.slice(0, 6);
        localStorage.setItem('career_ai_activity', JSON.stringify(activity));
      } catch (e) {
        console.warn('Could not save activity log:', e);
      }
    },
  
    /**
     * Utility to toggle loading indicators and error messages consistently across all pages.
     */
    setUIState({ loaderId, errorId, buttonId, isLoading, errorMessage = '' }) {
      const loader = document.getElementById(loaderId);
      const errorBox = document.getElementById(errorId);
      const button = document.getElementById(buttonId);
  
      if (loader) {
        loader.classList.toggle('show', isLoading);
      }
      if (button) {
        button.disabled = isLoading;
      }
      if (errorBox) {
        if (errorMessage) {
          errorBox.textContent = errorMessage;
          errorBox.classList.add('show');
        } else {
          errorBox.textContent = '';
          errorBox.classList.remove('show');
        }
      }
    }
  };