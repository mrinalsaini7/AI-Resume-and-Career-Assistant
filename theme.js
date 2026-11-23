/**
 * Handles Light/Dark theme switching with localStorage persistence
 * and responsive mobile navigation drawer toggling.
 */
document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
  
    // 1. Load saved theme or default to light
    const savedTheme = localStorage.getItem('career_ai_theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeButtonText(savedTheme);
  
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', nextTheme);
        localStorage.setItem('career_ai_theme', nextTheme);
        updateThemeButtonText(nextTheme);
      });
    }
  
    function updateThemeButtonText(theme) {
      if (!themeBtn) return;
      themeBtn.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
      themeBtn.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    }
  
    // 2. Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = navLinks.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', String(isExpanded));
      });
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  function readSavedTheme() {
    try {
      return localStorage.getItem('career_ai_theme') || 'light';
    } catch {
      return 'light';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem('career_ai_theme', theme);
    } catch {
      // Ignore storage restrictions
    }
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
  }

  applyTheme(readSavedTheme());

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  }

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
});