/**
 * Logic for Page 5: Job Description Matcher
 * Compares user resume against a specific job description to identify keyword overlap and skill gaps.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('matcherForm');
    const resumeInput = document.getElementById('matcherResumeInput');
    const jdInput = document.getElementById('matcherJdInput');
    const loadDraftBtn = document.getElementById('matcherLoadDraftBtn');
    const outputBox = document.getElementById('matcherOutput');
    const copyBtn = document.getElementById('copyMatchBtn');
  
    // 1. Load saved resume draft
    if (loadDraftBtn) {
      loadDraftBtn.addEventListener('click', () => {
        const raw = localStorage.getItem('career_ai_resume_draft');
        if (!raw) {
          CareerAI.setUIState({
            loaderId: 'matcherLoader',
            errorId: 'matcherError',
            buttonId: 'matcherSubmitBtn',
            isLoading: false,
            errorMessage: 'No saved draft found. Save a resume in AI Resume Builder first.'
          });
          return;
        }
  
        const d = JSON.parse(raw);
        resumeInput.value = [
          d.fullName,
          d.targetRole ? `Target Role: ${d.targetRole}` : '',
          d.education ? `EDUCATION:\n${d.education}` : '',
          d.skills ? `SKILLS:\n${d.skills}` : '',
          d.experience ? `EXPERIENCE & PROJECTS:\n${d.experience}` : ''
        ]
          .filter(Boolean)
          .join('\n\n');
  
        CareerAI.setUIState({
          loaderId: 'matcherLoader',
          errorId: 'matcherError',
          buttonId: 'matcherSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 2. Compare Resume vs Job Description
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resumeText = resumeInput.value.trim();
        const jdText = jdInput.value.trim();
  
        if (resumeText.length < 40 || jdText.length < 40) {
          CareerAI.setUIState({
            loaderId: 'matcherLoader',
            errorId: 'matcherError',
            buttonId: 'matcherSubmitBtn',
            isLoading: false,
            errorMessage: 'Please enter both your resume (at least 40 chars) and the job description (at least 40 chars).'
          });
          return;
        }
  
        const systemInstruction =
          'You are an ATS (Applicant Tracking System) matching specialist and technical career coach. ' +
          'Compare the candidate\'s resume against the target Job Description. Structure your output clearly with these headings:\n' +
          '1. ESTIMATED MATCH SCORE (0-100%) & FIT VERDICT\n' +
          '2. MATCHED QUALIFICATIONS & KEYWORDS (Skills already present)\n' +
          '3. MISSING KEYWORDS & SKILL GAPS (Important terms in the JD not found in the resume)\n' +
          '4. ACTIONABLE TAILORING PLAN (How the student can honestly incorporate missing keywords or highlight transferable projects)\n' +
          '5. TAILORED RESUME SUMMARY (A 3-line summary written specifically for this job)';
  
        const prompt = `CANDIDATE RESUME:\n${resumeText}\n\n---\n\nTARGET JOB DESCRIPTION:\n${jdText}`;
  
        try {
          CareerAI.setUIState({
            loaderId: 'matcherLoader',
            errorId: 'matcherError',
            buttonId: 'matcherSubmitBtn',
            isLoading: true
          });
  
          const analysis = await CareerAI.generate({
            prompt,
            systemInstruction,
            toolName: 'Job Description Matcher'
          });
  
          outputBox.textContent = analysis;
        } catch (err) {
          CareerAI.setUIState({
            loaderId: 'matcherLoader',
            errorId: 'matcherError',
            buttonId: 'matcherSubmitBtn',
            isLoading: false,
            errorMessage: err.message
          });
          return;
        }
  
        CareerAI.setUIState({
          loaderId: 'matcherLoader',
          errorId: 'matcherError',
          buttonId: 'matcherSubmitBtn',
          isLoading: false
        });
      });
    }
  
    // 3. Copy match analysis
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(outputBox.textContent);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Results';
          }, 2000);
        } catch {
          alert('Could not copy automatically. Please select and copy manually.');
        }
      });
    }
  });