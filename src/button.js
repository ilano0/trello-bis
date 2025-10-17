export function createSidebarButtons() 
{
    const sidebar = document.querySelector('aside');
    const nav = document.createElement('nav');
    
    nav.className = 'flex flex-col gap-10 p-4';
    if (!sidebar) 
        return;
    const buttons = [
        { text: 'Tableau', onClick: () => alert('test 1') },
        { text: 'Cartes', onClick: () => alert('test 2') },
        { text: 'Se connecter', onClick: () => alert('test 3') },
        { text: 'Luminosité', onClick: () => alert('test 4') }
    ];
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded';
        button.textContent = btn.text;
        button.addEventListener('click', btn.onClick);
        nav.appendChild(button);
    });
    sidebar.appendChild(nav);
}