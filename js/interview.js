/**
 * Logic for Page 6: AI Interview Preparation
 * Generates role-specific technical and behavioral interview questions with STAR sample answers.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('interviewForm');
    const roleInput = document.getElementById('interviewRole');
    const focusSelect = document.getElementById('interviewFocus');
    const contextInput = document.getElementById('interviewContext');
    const loadDraftBtn = document.getElementById('interviewLoadDraftBtn');
    const outputBox = document.getElementById('interviewOutput');
    const copyBtn = document.getElementById('copyInterviewBtn');
  
    // 1. Optional: Load saved resume draft into context
    if (loadDraftBtn) {
      loadDraftBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('career_ai_resume_draft');
        if (!raw) {
          CareerAI.setUIState({
            loaderId: 'interviewLoader',
            errorId: 'interviewError',
            buttonId: 'interviewSubmitBtn',
            isLoading: false,
            errorMessage: 'No saved draft found in AI Resume Builder.'
          });
          return;
        }
  
        const d = JSON.parse(raw);
        if (d.targetRole && !roleInput.value) {
          roleInput.value = d.targetRole;
        }
        contextInput.value = [
          d.skills ? `Skills: ${d.skills}` : '',
          d.experience ? `Projects/Experience:\n${d.experience}` : ''
        ]
          .filter(Boolean)
          .join('\n\n');
  
        CareerAI.setUIState({
          loaderId: 'interviewLoader',
          errorId: 'interviewError',
          buttonId: 'interviewSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 2. Generate Interview Guide via Gemini
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = roleInput.value.trim();
        const focus = focusSelect.value;
        const extraContext = contextInput.value.trim();
  
        if (role.length < 2) {
          CareerAI.setUIState({
            loaderId: 'interviewLoader',
            errorId: 'interviewError',
            buttonId: 'interviewSubmitBtn',
            isLoading: false,
            errorMessage: 'Please enter the target job or internship role.'
          });
          return;
        }
  
        const systemInstruction =
          'You are an experienced hiring manager coaching a college student or fresh graduate for an upcoming interview. ' +
          'Generate 6 realistic interview questions tailored to the target role and round focus. ' +
          'For EACH question, provide:\n' +
          '- Question (numbered 1 to 6)\n' +
          '- What the Interviewer Is Looking For (1-2 sentences)\n' +
          '- Sample Strong Answer (using the STAR method: Situation, Task, Action, Result where applicable)\n' +
          'Keep answers authentic to an entry-level candidate.';
  
        const prompt =
          `Target Role: ${role}\n` +
          `Interview Round Focus: ${focus}\n` +
          `Candidate Background / Job Details: ${extraContext || 'Entry-level student / fresh graduate'}`;
  
        try {
          CareerAI.setUIState({
            loaderId: 'interviewLoader',
            errorId: 'interviewError',
            buttonId: 'interviewSubmitBtn',
            isLoading: true
          });
  
          const guide = await CareerAI.generate({
            prompt,
            systemInstruction,
            toolName: 'AI Interview Prep'
          });
  
          outputBox.textContent = guide;
        } catch (err) {
          CareerAI.setUIState({
            loaderId: 'interviewLoader',
            errorId: 'interviewError',
            buttonId: 'interviewSubmitBtn',
            isLoading: false,
            errorMessage: err.message
          });
          return;
        }
  
        CareerAI.setUIState({
          loaderId: 'interviewLoader',
          errorId: 'interviewError',
          buttonId: 'interviewSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 3. Copy guide
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(outputBox.textContent);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Prep Guide';
          }, 2000);
        } catch {
          alert('Could not copy automatically. Please select and copy manually.');
        }
      });
    }
  });