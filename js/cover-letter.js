/**
 * Logic for Page 7: Cover Letter Generator
 * Drafts tailored, modern cover letters for students and entry-level job seekers.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('coverLetterForm');
    const nameInput = document.getElementById('clName');
    const companyInput = document.getElementById('clCompany');
    const roleInput = document.getElementById('clRole');
    const toneSelect = document.getElementById('clTone');
    const highlightsInput = document.getElementById('clHighlights');
    const loadDraftBtn = document.getElementById('clLoadDraftBtn');
    const outputBox = document.getElementById('clOutput');
    const copyBtn = document.getElementById('copyClBtn');
  
    // 1. Load saved draft data from Resume Builder
    if (loadDraftBtn) {
      loadDraftBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('career_ai_resume_draft');
        if (!raw) {
          CareerAI.setUIState({
            loaderId: 'clLoader',
            errorId: 'clError',
            buttonId: 'clSubmitBtn',
            isLoading: false,
            errorMessage: 'No saved draft found in AI Resume Builder.'
          });
          return;
        }
  
        const d = JSON.parse(raw);
        if (d.fullName && !nameInput.value) nameInput.value = d.fullName;
        if (d.targetRole && !roleInput.value) roleInput.value = d.targetRole;
        highlightsInput.value = [
          d.education ? `Education: ${d.education}` : '',
          d.skills ? `Skills: ${d.skills}` : '',
          d.experience ? `Projects & Experience:\n${d.experience}` : ''
        ]
          .filter(Boolean)
          .join('\n\n');
  
        CareerAI.setUIState({
          loaderId: 'clLoader',
          errorId: 'clError',
          buttonId: 'clSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 2. Generate Cover Letter
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const company = companyInput.value.trim();
        const role = roleInput.value.trim();
        const tone = toneSelect.value;
        const highlights = highlightsInput.value.trim();
  
        if (!name || !company || !role || highlights.length < 20) {
          CareerAI.setUIState({
            loaderId: 'clLoader',
            errorId: 'clError',
            buttonId: 'clSubmitBtn',
            isLoading: false,
            errorMessage: 'Please fill in your name, company, role, and at least 20 characters of highlights.'
          });
          return;
        }
  
        const systemInstruction =
          'You are an expert career writer helping a student or fresh graduate write an impactful, modern cover letter. ' +
          'Write a well-structured 3-to-4 paragraph cover letter (approx. 250-330 words) with proper salutation and sign-off. ' +
          'Avoid generic clichés, highlight specific projects/skills provided by the user, and match the requested tone.';
  
        const prompt =
          `Candidate Name: ${name}\n` +
          `Target Company: ${company}\n` +
          `Target Role: ${role}\n` +
          `Requested Tone: ${tone}\n` +
          `Candidate Highlights & Context:\n${highlights}`;
  
        try {
          CareerAI.setUIState({
            loaderId: 'clLoader',
            errorId: 'clError',
            buttonId: 'clSubmitBtn',
            isLoading: true
          });
  
          const letter = await CareerAI.generate({
            prompt,
            systemInstruction,
            toolName: 'Cover Letter Generator'
          });
  
          outputBox.textContent = letter;
        } catch (err) {
          CareerAI.setUIState({
            loaderId: 'clLoader',
            errorId: 'clError',
            buttonId: 'clSubmitBtn',
            isLoading: false,
            errorMessage: err.message
          });
          return;
        }
  
        CareerAI.setUIState({
          loaderId: 'clLoader',
          errorId: 'clError',
          buttonId: 'clSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 3. Copy Cover Letter
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(outputBox.textContent);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Cover Letter';
          }, 2000);
        } catch {
          alert('Could not copy automatically. Please select and copy manually.');
        }
      });
    }
  });