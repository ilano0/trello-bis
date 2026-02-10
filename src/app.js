import { createSidebarButtons } from './button.js';
import { renderBoards } from './boards.js';

document.addEventListener('DOMContentLoaded', () => {
    createSidebarButtons();
    renderBoards();
});