document.addEventListener('DOMContentLoaded', () => {
  // 다크 모드
  const toggle = document.getElementById('darkModeToggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.checked = true;
  }
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  });

  // To-Do 리스트
  const form = document.getElementById('taskForm');
  const input = document.getElementById('taskInput');
  const due = document.getElementById('dueInput');
  const prio = document.getElementById('priorityInput');
  const cat = document.getElementById('categoryInput');
  const activeList = document.getElementById('activeList');
  const completedList = document.getElementById('completedList');
  const countA = document.getElementById('countActive');
  const countC = document.getElementById('countCompleted');
  const FILTERS = document.querySelectorAll('.filters button');
  const search = document.getElementById('searchInput');
  const TODO_KEY = 'todoTasks';

  let todos = [];

  function saveTodos() {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
    filterAndRender();
  }

  function loadTodos() {
    todos = JSON.parse(localStorage.getItem(TODO_KEY) || '[]');
    filterAndRender();
  }

  function updateCounts() {
    countA.textContent = todos.filter(t => !t.done).length;
    countC.textContent = todos.filter(t => t.done).length;
  }

  function filterAndRender() {
    const activeFilter = document.querySelector('.filters button.active').dataset.filter;
    activeList.innerHTML = '';
    completedList.innerHTML = '';
    todos
      .filter(t => {
        if (activeFilter === 'active' && t.done) return false;
        if (activeFilter === 'completed' && !t.done) return false;
        if (activeFilter === 'dueToday') {
          const today = new Date().toISOString().slice(0, 10);
          if (t.due !== today) return false;
        }
        if (search.value && !t.text.includes(search.value)) return false;
        return true;
      })
      .forEach(t => {
        const el = createTodoEl(t);
        (t.done ? completedList : activeList).appendChild(el);
      });
    updateCounts();
  }

  function createTodoEl(t) {
    const item = document.createElement('div');
    item.className = `task-item ${t.priority}`;
    item.draggable = true;
    item.innerHTML = `
      <span class="task-text">${t.text}</span>
      <span class="task-meta">${t.due || ''} ${t.category || ''}</span>
      <div class="task-actions">
        ${t.done ? '' : '<button class="complete-btn"><i class="fas fa-check"></i></button>'}
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;
    if (!t.done) {
      item.querySelector('.complete-btn').addEventListener('click', () => {
        t.done = true;
        saveTodos();
      });
    }
    item.querySelector('.delete-btn').addEventListener('click', () => {
      todos = todos.filter(x => x.id !== t.id);
      saveTodos();
    });
    // Drag & Drop
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', t.id);
    });
    return item;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    todos.push({
      id: Date.now(),
      text: input.value,
      done: false,
      due: due.value,
      priority: prio.value,
      category: cat.value
    });
    input.value = '';
    due.value = '';
    prio.value = 'medium';
    cat.value = '';
    saveTodos();
  });

  FILTERS.forEach(btn => {
    btn.addEventListener('click', () => {
      FILTERS.forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      filterAndRender();
    });
  });

  search.addEventListener('input', filterAndRender);

  [activeList, completedList].forEach(list => {
    list.addEventListener('dragover', e => e.preventDefault());
    list.addEventListener('drop', e => {
      const id = Number(e.dataTransfer.getData('text/plain'));
      const t = todos.find(x => x.id === id);
      t.done = list === completedList;
      saveTodos();
    });
  });

  loadTodos();

  // 알림: 오늘 기한 항목
  if (Notification.permission === 'default') Notification.requestPermission();
  if (Notification.permission === 'granted') {
    const today = new Date().toISOString().slice(0, 10);
    todos
      .filter(t => !t.done && t.due === today)
      .forEach(t => new Notification('오늘 기한', { body: t.text }));
  }

  // Calendar
  const calGrid = document.getElementById('calendarGrid');
  const monthYear = document.getElementById('monthYear');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const CAL_KEY = 'calendarEvents';
  let nowDate = new Date();
  let cy = nowDate.getFullYear();
  let cm = nowDate.getMonth();

  function loadCal() {
    return JSON.parse(localStorage.getItem(CAL_KEY) || '{}');
  }
  function saveCal(e) {
    localStorage.setItem(CAL_KEY, JSON.stringify(e));
  }

  function renderCal() {
    calGrid.innerHTML = '';
    const evs = loadCal();
    ['일','월','화','수','목','금','토'].forEach(d => {
      const dn = document.createElement('div');
      dn.className = 'day-name';
      dn.textContent = d;
      calGrid.appendChild(dn);
    });
    const firstDay = new Date(cy, cm, 1).getDay();
    const lastDate = new Date(cy, cm + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day-cell inactive';
      calGrid.appendChild(empty);
    }
    for (let d = 1; d <= lastDate; d++) {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      const key = `${cy}-${String(cm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cell.innerHTML = `<div class="date">${d}</div><div class="events"></div>`;
      (evs[key]||[]).forEach(txt => {
        const ev = document.createElement('div');
        ev.className = 'event';
        ev.textContent = txt;
        cell.querySelector('.events').appendChild(ev);
      });
      cell.addEventListener('click', () => {
        const txt = prompt(`일정 추가: ${key}`);
        if (!txt) return;
        evs[key] = evs[key] || [];
        evs[key].push(txt);
        saveCal(evs);
        renderCal();
      });
      calGrid.appendChild(cell);
    }
    monthYear.textContent = `${cy}년 ${cm+1}월`;
  }

  prevBtn.addEventListener('click', () => { cm--; if (cm < 0) { cm = 11; cy--; } renderCal(); });
  nextBtn.addEventListener('click', () => { cm++; if (cm > 11) { cm = 0; cy++; } renderCal(); });
  renderCal();
});
