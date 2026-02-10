import { toggleTheme } from './theme.js';
import { toggleBoardsPanel, createBoard } from './ui.js';

export function createSidebarButtons() 
{
    const API_BASE = window.API_BASE || 'http://localhost:4000';
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    const nav = document.createElement('nav');
    nav.className = 'flex flex-col gap-4 p-4';
    nav.setAttribute('role', 'navigation');

    const buttons = [
        {text: 'Boards', onClick: () => toggleBoardsPanel(nav, API_BASE) },
        {text: 'Créer un board', onClick: () => createBoard(API_BASE) },
        {text: 'Mode nuit', onClick: () => toggleTheme() }
    ];
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded';
        button.textContent = btn.text;
        button.addEventListener('click', btn.onClick);
        nav.appendChild(button);
    });

    sidebar.appendChild(nav);
}