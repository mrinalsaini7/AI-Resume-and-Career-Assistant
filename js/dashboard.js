/**
 * Populates the Dashboard with real user metrics stored in localStorage.
 */
document.addEventListener('DOMContentLoaded', () => {
    const totalRunsEl = document.getElementById('statTotalRuns');
    const savedResumeEl = document.getElementById('statSavedResume');
    const activityListEl = document.getElementById('recentActivityList');
    const clearBtn = document.getElementById('clearHistoryBtn');
  
    function renderDashboard() {
      // 1. Load AI usage logs
      const rawActivity = localStorage.getItem('career_ai_activity');
      const activity = rawActivity ? JSON.parse(rawActivity) : { totalRuns: 0, recent: [] };
  
      if (totalRunsEl) {
        totalRunsEl.textContent = String(activity.totalRuns);
      }
  
      // 2. Check if user has saved a resume draft in Builder
      const hasResumeDraft = Boolean(localStorage.getItem('career_ai_resume_draft'));
      if (savedResumeEl) {
        savedResumeEl.textContent = hasResumeDraft ? 'Yes' : 'No';
      }
  
      // 3. Render recent sessions
      if (activityListEl) {
        activityListEl.innerHTML = '';
        if (!activity.recent || activity.recent.length === 0) {
          const li = document.createElement('li');
          li.textContent = 'No AI sessions recorded yet. Open any tool to begin.';
          activityListEl.appendChild(li);
        } else {
          activity.recent.forEach((item) => {
            const li = document.createElement('li');
            li.style.padding = '0.5rem 0';
            li.style.borderBottom = '1px solid var(--border-color)';
            li.textContent = `${item.tool} — ${item.timestamp}`;
            activityListEl.appendChild(li);
          });
        }
      }
    }
  
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        localStorage.removeItem('career_ai_activity');
        renderDashboard();
      });
    }
  
    renderDashboard();
  });