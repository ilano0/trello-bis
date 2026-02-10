const API_BASE = window.API_BASE || 'http://localhost:4000';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

function createTaskCard(task) 
{
  const card = document.createElement('div');
  card.className = 'bg-white shadow p-3 mb-3 rounded border';
  card.draggable = true;
  card.dataset.taskId = task._id;
  const title = document.createElement('div');
  title.className = 'font-medium text-sm';
  title.textContent = task.title || '(sans titre)';
  const desc = document.createElement('div');
  desc.className = 'text-xs text-gray-600 mt-1';
  desc.textContent = task.description || '';
  const actions = document.createElement('div');
  actions.className = 'flex gap-2 mt-2';
  const del = document.createElement('button');
  del.className = 'text-red-500 text-xs';
  del.textContent = 'Supprimer';
  
  del.addEventListener('click', async () => {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
      await fetchJSON(`${API_BASE}/api/tasks/${task._id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('task:changed'));
    } catch (err) {
      console.error(err);
      alert('Erreur suppression');
    }
  });
  actions.appendChild(del);

  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task._id, from: task.status }));
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('opacity-60');
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('opacity-60');
  });

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(actions);
  return card;
}

function createColumn(boardId, column, tasksForColumn) {
  const col = document.createElement('div');
  col.className = 'w-72 bg-gray-50 p-3 rounded';
  col.dataset.colKey = column.key;

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-2';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'flex items-center gap-2';

  const title = document.createElement('div');
  title.className = 'font-semibold';
  title.textContent = `${column.name} (${tasksForColumn.length})`;

  const delColBtn = document.createElement('button');
  delColBtn.type = 'button';
  delColBtn.className = 'ml-2 text-sm text-red-600 hover:text-white hover:bg-red-600 rounded px-2';
  delColBtn.title = 'Supprimer la colonne';
  delColBtn.textContent = '×';
  delColBtn.addEventListener('click', async () => {
    if (!confirm(`Supprimer la colonne "${column.name}" ? Les tâches seront réassignées.`)) return;
    try {
      await fetchJSON(`${API_BASE}/api/boards/${boardId}/columns/${encodeURIComponent(column.key)}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('board:changed'));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression de la colonne');
    }
  });

  titleWrap.appendChild(title);
  titleWrap.appendChild(delColBtn);

  const addBtn = document.createElement('button');
  addBtn.className = 'text-sm bg-blue-500 text-white px-2 py-1 rounded';
  addBtn.textContent = 'Ajouter';
  addBtn.addEventListener('click', async () => {
    const t = prompt('Titre de la tâche :');
    if (!t) return;
    const desc = prompt('Description (optionnelle) :') || '';
    try {
      await fetchJSON(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, description: desc, board: boardId, status: column.key })
      });
      window.dispatchEvent(new CustomEvent('task:changed'));
    } catch (e) {
      console.error(e);
      alert('Erreur création tâche');
    }
  });

  header.appendChild(titleWrap);
  header.appendChild(addBtn);

  const list = document.createElement('div');
  list.className = 'flex flex-col';
  list.style.minHeight = '40px';

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    list.classList.add('ring-2', 'ring-blue-300');
  });
  list.addEventListener('dragleave', () => {
    list.classList.remove('ring-2', 'ring-blue-300');
  });
  list.addEventListener('drop', async (e) => {
    e.preventDefault();
    list.classList.remove('ring-2', 'ring-blue-300');
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch (err) {
      return;
    }
    const taskId = payload && payload.id;
    if (!taskId) return;

    const srcCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (srcCard) {
      list.appendChild(srcCard);
    }

    try {
      await fetchJSON(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: column.key, board: boardId })
      });
      window.dispatchEvent(new CustomEvent('task:changed'));
    } catch (err) {
      console.error('Failed to update task status', err);
      alert('Erreur lors du déplacement, rechargez la page.');
      window.dispatchEvent(new CustomEvent('board:changed'));
    }
  });

  tasksForColumn.forEach(t => list.appendChild(createTaskCard(t)));
  col.appendChild(header);
  col.appendChild(list);
  return col;
}

function createBoardElement(board, tasks) {
  const boardWrap = document.createElement('div');
  boardWrap.className = 'mb-8';

  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center justify-between mb-3';

  const title = document.createElement('h2');
  title.className = 'text-lg font-semibold';
  title.textContent = board.name;
  headerRow.appendChild(title);

  // actions: + pour ajouter colonne, corbeille pour supprimer board
  const actionsWrap = document.createElement('div');
  actionsWrap.className = 'flex gap-2 items-center';

  // + button (ajouter colonne)
  const addColBtn = document.createElement('button');
  addColBtn.className = 'w-8 h-8 flex items-center justify-center rounded bg-green-500 text-white';
  addColBtn.title = 'Ajouter une colonne';
  addColBtn.textContent = '+';
  addColBtn.addEventListener('click', async () => {
    const colName = prompt('Nom de la colonne :');
    if (!colName) return;
    const key = colName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      // <-- use board._id (was boardId) and correct endpoint /api/boards/:id/columns
      await fetchJSON(`${API_BASE}/api/boards/${board._id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, name: colName })
      });
      window.dispatchEvent(new CustomEvent('board:changed'));
    } catch (err) {
      console.error('Erreur ajout de colonne:', err);
      alert('Erreur ajout de colonne: ' + (err.message || err));
    }
  });

  const deleteBoardBtn = document.createElement('button');
  deleteBoardBtn.className = 'w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white';
  deleteBoardBtn.title = 'Supprimer le board';
  deleteBoardBtn.textContent = '🗑';
  deleteBoardBtn.addEventListener('click', async () => {
    if (!confirm('Supprimer le board et toutes les tâches associées ?')) return;
    try {
      await fetchJSON(`${API_BASE}/api/boards/${board._id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('board:changed'));
      alert('Board supprimé');
    } catch (error) {
      console.error(error);
      alert('Erreur suppression du board');
    }
  });

  actionsWrap.appendChild(addColBtn);
  actionsWrap.appendChild(deleteBoardBtn);
  headerRow.appendChild(actionsWrap);

  boardWrap.appendChild(headerRow);

  const cols = document.createElement('div');
  cols.className = 'flex gap-4 overflow-x-auto pb-2';

  const columns = Array.isArray(board.columns) ? board.columns : [];

  if (columns.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-gray-600';
    empty.textContent = 'Aucune colonne. Utilise "Ajouter une colonne" pour commencer.';
    cols.appendChild(empty);
  } else {
    columns.forEach(colDef => {
      const tasksForCol = tasks.filter(t => (t.status || 'todo') === colDef.key);
      cols.appendChild(createColumn(board._id, colDef, tasksForCol));
    });
  }

  boardWrap.appendChild(cols);
  return boardWrap;
}

export async function renderBoards() {
  const mainSection = document.querySelector('main section') || document.querySelector('section');
  if (!mainSection) return;

  mainSection.innerHTML = '';
  const loader = document.createElement('div');
  loader.textContent = 'Chargement des tableaux...';
  loader.className = 'text-gray-600';
  mainSection.appendChild(loader);

  try {
    const boards = await fetchJSON(`${API_BASE}/api/boards`);
    mainSection.innerHTML = '';
    if (!boards.length) {
      const empty = document.createElement('div');
      empty.textContent = 'Aucun tableau trouvé.';
      empty.className = 'text-gray-600';
      mainSection.appendChild(empty);
      return;
    }

    // if a board is selected, show only that board
    const selectedId = localStorage.getItem('selectedBoardId');
    const boardsToShow = selectedId ? boards.filter(b => b._id === selectedId) : boards;

    for (const board of boardsToShow) {
      let tasks = [];
      try {
        tasks = await fetchJSON(`${API_BASE}/api/boards/${board._id}/tasks`);
      } catch (err) {
        console.error('Failed to fetch tasks for board', board._id, err);
      }
      const boardEl = createBoardElement(board, tasks);
      mainSection.appendChild(boardEl);
    }

    // if a board is selected but not found (maybe deleted), clear selection
    if (selectedId && boardsToShow.length === 0) {
      localStorage.removeItem('selectedBoardId');
    }

  } catch (err) {
    mainSection.innerHTML = '';
    const errEl = document.createElement('div');
    errEl.className = 'text-red-600';
    errEl.textContent = `Erreur: ${err.message}`;
    mainSection.appendChild(errEl);
    console.error(err);
  }
}

// add listener to re-render when a board is chosen
window.addEventListener('board:selected', () => {
  renderBoards().catch(console.error);
});
window.addEventListener('board:changed', () => {
  renderBoards().catch(console.error);
});
window.addEventListener('task:changed', () => {
  renderBoards().catch(console.error);
});