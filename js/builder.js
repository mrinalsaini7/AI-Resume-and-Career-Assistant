/**
 * Logic for Page 3: AI Resume Builder
 * - Live syncs form inputs to the preview sheet
 * - Uses Gemini API via CareerAI.generate() to rewrite project/experience notes into ATS bullet points
 * - Saves and loads drafts in localStorage
 */
document.addEventListener('DOMContentLoaded', () => {
    const fields = {
      fullName: document.getElementById('fullName'),
      contactInfo: document.getElementById('contactInfo'),
      targetRole: document.getElementById('targetRole'),
      education: document.getElementById('educationInput'),
      skills: document.getElementById('skillsInput'),
      experience: document.getElementById('experienceInput')
    };
  
    const preview = {
      name: document.getElementById('prevName'),
      contact: document.getElementById('prevContact'),
      objective: document.getElementById('prevObjective'),
      education: document.getElementById('prevEducation'),
      skills: document.getElementById('prevSkills'),
      experience: document.getElementById('prevExperience')
    };
  
    const enhanceBtn = document.getElementById('enhanceBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const printResumeBtn = document.getElementById('printResumeBtn');
    const successBox = document.getElementById('builderSuccess');
  
    // 1. Update live preview whenever user types
    function updateLivePreview() {
      preview.name.textContent = fields.fullName.value.trim() || 'YOUR FULL NAME';
      preview.contact.textContent = fields.contactInfo.value.trim() || 'email@example.com | Phone | Location | Portfolio/GitHub';
  
      const role = fields.targetRole.value.trim();
      preview.objective.textContent = role
        ? `Aspiring ${role} seeking an opportunity to contribute strong analytical, technical, and collaborative skills.`
        : 'Motivated candidate seeking an entry-level opportunity to apply technical and problem-solving skills.';
  
      preview.education.textContent = fields.education.value.trim() || 'Your degree, university, and graduation year will appear here.';
      preview.skills.textContent = fields.skills.value.trim() || 'Your programming languages, frameworks, and tools will appear here.';
      preview.experience.textContent = fields.experience.value.trim() || '• Enter your raw project or internship notes on the left and click "Enhance Bullets with Gemini".';
    }
  
    Object.values(fields).forEach((inputEl) => {
      if (inputEl) {
        inputEl.addEventListener('input', updateLivePreview);
      }
    });
  
    // 2. Load saved draft if available in localStorage
    function loadSavedDraft() {
      try {
        const saved = localStorage.getItem('career_ai_resume_draft');
        if (!saved) return;
        const data = JSON.parse(saved);
        fields.fullName.value = data.fullName || '';
        fields.contactInfo.value = data.contactInfo || '';
        fields.targetRole.value = data.targetRole || '';
        fields.education.value = data.education || '';
        fields.skills.value = data.skills || '';
        fields.experience.value = data.experience || '';
        updateLivePreview();
      } catch (e) {
        console.warn('Could not load saved resume draft:', e);
      }
    }
  
    // 3. Save draft to localStorage
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        const draftData = {
          fullName: fields.fullName.value,
          contactInfo: fields.contactInfo.value,
          targetRole: fields.targetRole.value,
          education: fields.education.value,
          skills: fields.skills.value,
          experience: fields.experience.value
        };
        localStorage.setItem('career_ai_resume_draft', JSON.stringify(draftData));
        showSuccessMessage('Resume draft saved locally! Your Dashboard status is now updated.');
      });
    }
  
    // 4. Print / Export PDF
    if (printResumeBtn) {
      printResumeBtn.addEventListener('click', () => {
        window.print();
      });
    }
  
    // 5. Enhance Experience & Project Bullets using Gemini
    if (enhanceBtn) {
      enhanceBtn.addEventListener('click', async () => {
        hideSuccessMessage();
        const rawExperience = fields.experience.value.trim();
        const role = fields.targetRole.value.trim() || 'Entry-Level Candidate';
  
        if (rawExperience.length < 15) {
          CareerAI.setUIState({
            loaderId: 'builderLoader',
            errorId: 'builderError',
            buttonId: 'enhanceBtn',
            isLoading: false,
            errorMessage: 'Please enter at least a brief sentence describing a project, coursework, or internship first.'
          });
          return;
        }
  
        const systemInstruction =
          'You are an expert technical recruiter and resume writer for college students and fresh graduates. ' +
          'Rewrite the user\'s raw project or experience notes into clean, ATS-friendly resume bullet points starting with "• ". ' +
          'Use strong action verbs (Developed, Engineered, Automated, Analyzed), highlight tools/technologies, and preserve factual accuracy without inventing fake companies or metrics. ' +
          'Return ONLY the formatted bullet points with no extra conversational intro or outro.';
  
        const prompt = `Target Role: ${role}\n\nRaw Notes to Rewrite:\n${rawExperience}`;
  
        try {
          CareerAI.setUIState({
            loaderId: 'builderLoader',
            errorId: 'builderError',
            buttonId: 'enhanceBtn',
            isLoading: true
          });
  
          const polishedBullets = await CareerAI.generate({
            prompt,
            systemInstruction,
            toolName: 'AI Resume Builder'
          });
  
          fields.experience.value = polishedBullets.trim();
          updateLivePreview();
          showSuccessMessage('Bullets enhanced! Review the live preview on the right and click "Save Draft Locally" to keep your changes.');
        } catch (err) {
          CareerAI.setUIState({
            loaderId: 'builderLoader',
            errorId: 'builderError',
            buttonId: 'enhanceBtn',
            isLoading: false,
            errorMessage: err.message
          });
          return;
        }
  
        CareerAI.setUIState({
          loaderId: 'builderLoader',
          errorId: 'builderError',
          buttonId: 'enhanceBtn',
          isLoading: false
        });
      });
    }
  
    function showSuccessMessage(msg) {
      if (!successBox) return;
      successBox.textContent = msg;
      successBox.classList.add('show');
    }
  
    function hideSuccessMessage() {
      if (!successBox) return;
      successBox.textContent = '';
      successBox.classList.remove('show');
    }
  
    loadSavedDraft();
    updateLivePreview();
  });