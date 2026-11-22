/**
 * Logic for Page 4: AI Resume Analyzer
 * Evaluates pasted resume text for ATS readiness, impact verbs, and clarity.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyzerForm');
    const roleInput = document.getElementById('analyzerRole');
    const resumeInput = document.getElementById('resumeTextInput');
    const loadDraftBtn = document.getElementById('loadDraftBtn');
    const outputBox = document.getElementById('analyzerOutput');
    const copyBtn = document.getElementById('copyAnalysisBtn');
  
    // 1. Load saved draft from Builder if user saved one
    if (loadDraftBtn) {
      loadDraftBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('career_ai_resume_draft');
        if (!raw) {
          CareerAI.setUIState({
            loaderId: 'analyzerLoader',
            errorId: 'analyzerError',
            buttonId: 'analyzeSubmitBtn',
            isLoading: false,
            errorMessage: 'No saved draft found. Build and save a draft in AI Resume Builder first.'
          });
          return;
        }
  
        const d = JSON.parse(raw);
        resumeInput.value = [
          d.fullName,
          d.contactInfo,
          d.targetRole ? `Target Role: ${d.targetRole}` : '',
          d.education ? `\nEDUCATION\n${d.education}` : '',
          d.skills ? `\nSKILLS\n${d.skills}` : '',
          d.experience ? `\nPROJECTS & EXPERIENCE\n${d.experience}` : ''
        ]
          .filter(Boolean)
          .join('\n');
  
        if (d.targetRole && !roleInput.value) {
          roleInput.value = d.targetRole;
        }
  
        CareerAI.setUIState({
          loaderId: 'analyzerLoader',
          errorId: 'analyzerError',
          buttonId: 'analyzeSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 2. Submit resume to Gemini for structured evaluation
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resumeText = resumeInput.value.trim();
        const targetRole = roleInput.value.trim() || 'General Entry-Level / Internship';
  
        if (resumeText.length < 50) {
          CareerAI.setUIState({
            loaderId: 'analyzerLoader',
            errorId: 'analyzerError',
            buttonId: 'analyzeSubmitBtn',
            isLoading: false,
            errorMessage: 'Please paste at least 50 characters of resume content for an accurate analysis.'
          });
          return;
        }
  
        const systemInstruction =
          'You are a senior university career advisor and Applicant Tracking System (ATS) specialist. ' +
          'Analyze the student\'s resume and structure your response clearly with these exact headings:\n' +
          '1. OVERALL RESUME SCORE (X/100) & SUMMARY\n' +
          '2. KEY STRENGTHS\n' +
          '3. AREAS FOR IMPROVEMENT (Weak verbs, missing metrics, vagueness)\n' +
          '4. ATS FORMATTING & KEYWORD RECOMMENDATIONS\n' +
          '5. BEFORE & AFTER BULLET REWRITES (Show 2-3 improved examples from their text)\n' +
          'Keep tone constructive, practical, and tailored to students/fresh graduates.';
  
        const prompt = `Target Role: ${targetRole}\n\nResume Content:\n${resumeText}`;
  
        try {
          CareerAI.setUIState({
            loaderId: 'analyzerLoader',
            errorId: 'analyzerError',
            buttonId: 'analyzeSubmitBtn',
            isLoading: true
          });
  
          const report = await CareerAI.generate({
            prompt,
            systemInstruction,
            toolName: 'AI Resume Analyzer'
          });
  
          outputBox.textContent = report;
        } catch (err) {
          CareerAI.setUIState({
            loaderId: 'analyzerLoader',
            errorId: 'analyzerError',
            buttonId: 'analyzeSubmitBtn',
            isLoading: false,
            errorMessage: err.message
          });
          return;
        }
  
        CareerAI.setUIState({
          loaderId: 'analyzerLoader',
          errorId: 'analyzerError',
          buttonId: 'analyzeSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 3. Copy report to clipboard
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(outputBox.textContent);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Report';
          }, 2000);
        } catch {
          alert('Could not copy automatically. Please select and copy the text manually.');
        }
      });
    }
  });