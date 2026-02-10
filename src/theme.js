const THEME_KEY = 'theme';

window.tailwind = window.tailwind || {};
window.tailwind.config = window.tailwind.config || {};
window.tailwind.config.darkMode = 'class';

export function applyStoredTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
}

export function toggleTheme() {
  try {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch (e) {}
}

applyStoredTheme();