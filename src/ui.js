export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function toggleBoardsPanel(nav, API_BASE) {
  let panel = document.querySelector('#boards-panel');
  if (panel) {
    panel.remove();
    return;
  }
  panel = document.createElement('div');
  panel.id = 'boards-panel';
  panel.className = 'mt-2 bg-white border rounded shadow p-3 max-h-64 overflow-auto';

  const title = document.createElement('div');
  title.className = 'font-semibold mb-2';
  title.textContent = 'Choisir un board';
  panel.appendChild(title);

  const list = document.createElement('div');
  list.className = 'flex flex-col gap-1';
  panel.appendChild(list);

  fetchJSON(`${API_BASE}/api/boards`)
    .then(boards => {
      if (!boards.length) {
        const empty = document.createElement('div');
        empty.className = 'text-gray-600';
        empty.textContent = 'Aucun board';
        list.appendChild(empty);
        return;
      }

      const allBtn = document.createElement('button');
      allBtn.className = 'text-left px-2 py-1 rounded hover:bg-gray-100';
      allBtn.textContent = 'Afficher tous les boards';
      allBtn.addEventListener('click', () => {
        localStorage.removeItem('selectedBoardId');
        window.dispatchEvent(new CustomEvent('board:selected', { detail: null }));
        panel.remove();
      });
      list.appendChild(allBtn);

      boards.forEach(b => {
        const item = document.createElement('button');
        item.className = 'text-left px-2 py-1 rounded hover:bg-gray-100';
        item.textContent = b.name || '(sans nom)';
        item.addEventListener('click', () => {
          localStorage.setItem('selectedBoardId', b._id);
          window.dispatchEvent(new CustomEvent('board:selected', { detail: b._id }));
          panel.remove();
        });
        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error(err);
      const errEl = document.createElement('div');
      errEl.className = 'text-red-600';
      errEl.textContent = 'Impossible de récupérer les boards';
      list.appendChild(errEl);
    });

  nav.appendChild(panel);
}

export async function createBoard(API_BASE) {
  const name = prompt('Nom du board :', 'Mon tableau');
  if (!name) return;
  const payload = { name, description: '', columns: [] };
  try {
    await postJSON(`${API_BASE}/api/boards`, payload);
    window.dispatchEvent(new CustomEvent('board:changed'));
    alert('Board créé');
  } catch (err) {
    console.error(err);
    alert('Erreur création board: ' + (err.message || err));
  }
}