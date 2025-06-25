document.addEventListener('DOMContentLoaded', () => {
  // 다크 모드 초기 설정
  const toggle = document.getElementById('darkModeToggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.checked = true;
  }
  // 다크 모드 토글 이벤트
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
    renderTodos();
  }
  function loadTodos() {
    todos = JSON.parse(localStorage.getItem(TODO_KEY) || '[]');
    renderTodos();
  }
  function renderTodos() {
    const filter = document.querySelector('.filters button.active').dataset.filter;
    activeList.innerHTML = '';
    completedList.innerHTML = '';
    todos
      .filter(t => {
        if (filter === 'active') return !t.done;
        if (filter === 'completed') return t.done;
        return true;
      })
      .filter(t => !search.value || t.text.includes(search.value))
      .forEach(t => {
        const item = document.createElement('div');
        item.className = 'task-item';
        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = t.text;
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        if (!t.done) {
          const doneBtn = document.createElement('button');
          doneBtn.innerHTML = '<i class="fas fa-check"></i>';
          doneBtn.addEventListener('click', () => { t.done = true; saveTodos(); });
          actions.appendChild(doneBtn);
        }
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<i class="fas fa-trash"></i>';
        delBtn.addEventListener('click', () => { todos = todos.filter(x => x.id !== t.id); saveTodos(); });
        actions.appendChild(delBtn);
        item.appendChild(text);
        item.appendChild(actions);
        (t.done ? completedList : activeList).appendChild(item);
      });
    countA.textContent = todos.filter(t => !t.done).length;
    countC.textContent = todos.filter(t => t.done).length;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const txt = input.value.trim();
    if (!txt) return;
    todos.push({ id: Date.now(), text: txt, done: false });
    input.value = '';
    saveTodos();
  });
  FILTERS.forEach(btn => btn.addEventListener('click', () => {
    FILTERS.forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    renderTodos();
  }));
  search.addEventListener('input', renderTodos);
  loadTodos();

  // Calendar with edit/delete on events and highlighter selection
  const calGrid = document.getElementById('calendarGrid');
  const monthYear = document.getElementById('monthYear');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const highlightToggle = document.getElementById('highlightToggle');
  const CAL_KEY = 'calendarEvents';
  let now = new Date(), cy = now.getFullYear(), cm = now.getMonth();
  let isHighlightMode = false;
  let dragStartCell = null;

  // Load & save calendar events
  function loadCal() {
    return JSON.parse(localStorage.getItem(CAL_KEY) || '{}');
  }
  function saveCal(evs) {
    localStorage.setItem(CAL_KEY, JSON.stringify(evs));
  }

  // Render calendar grid
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
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day-cell inactive';
      calGrid.appendChild(empty);
    }
    // Date cells
    for (let d = 1; d <= lastDate; d++) {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      const key = `${cy}-${String(cm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cell.dataset.key = key;
      cell.innerHTML = `<div class="date">${d}</div><div class="events"></div>`;
      // Render existing events
      (evs[key]||[]).forEach((txt, idx) => {
        const ev = document.createElement('div');
        ev.className = 'event';
        ev.textContent = txt;
        // Click to edit/delete
        ev.addEventListener('click', (e) => {
          e.stopPropagation();
          const newText = prompt('수정: 내용 입력 / 삭제는 공백 입력', ev.textContent);
          if (newText === null) return;
          if (newText.trim() === '') {
            evs[key].splice(idx, 1);
          } else {
            evs[key][idx] = newText;
          }
          if (evs[key].length === 0) delete evs[key];
          saveCal(evs);
          renderCal();
        });
        cell.querySelector('.events').appendChild(ev);
      });
      // Double-click to add single event
      cell.addEventListener('dblclick', () => {
        const txt = prompt(`일정 추가: ${key}`);
        if (!txt) return;
        evs[key] = evs[key]||[];
        evs[key].push(txt);
        saveCal(evs);
        renderCal();
      });
      // Drag selection for highlighter
      cell.addEventListener('mousedown', (e) => {
        if (!isHighlightMode || cell.classList.contains('inactive')) return;
        dragStartCell = cell;
        clearSelection();
        cell.classList.add('selected');
      });
      cell.addEventListener('mouseover', () => {
        if (!isHighlightMode || !dragStartCell) return;
        selectRange(dragStartCell, cell);
      });
      cell.addEventListener('mouseup', () => {
        if (!isHighlightMode || !dragStartCell) return;
        const selection = Array.from(document.querySelectorAll('.day-cell.selected'))
          .map(c => c.dataset.key);
        const title = prompt('형광펜 일정 제목 입력');
        if (title) {
          selection.forEach(k => {
            evs[k] = evs[k]||[];
            evs[k].push(title);
          });
          saveCal(evs);
        }
        clearSelection();
        renderCal();
        dragStartCell = null;
      });
      calGrid.appendChild(cell);
    }
    monthYear.textContent = `${cy}년 ${cm+1}월`;
  }

  // Highlight mode toggle
  highlightToggle.addEventListener('click', () => {
    isHighlightMode = !isHighlightMode;
    highlightToggle.classList.toggle('active', isHighlightMode);
  });

  // Utility to clear selection highlights
  function clearSelection() {
    document.querySelectorAll('.day-cell.selected')
      .forEach(c => c.classList.remove('selected'));
  }

  // Utility to select range between two cells
  function selectRange(start, end) {
    clearSelection();
    const cells = Array.from(document.querySelectorAll('.day-cell'))
      .filter(c => !c.classList.contains('inactive'));
    const startIndex = cells.indexOf(start);
    const endIndex = cells.indexOf(end);
    const [from, to] = startIndex < endIndex
      ? [startIndex, endIndex]
      : [endIndex, startIndex];
    cells.slice(from, to+1).forEach(c => c.classList.add('selected'));
  }

  // Month navigation
  document.getElementById('prevMonth').addEventListener('click', () => {
    cm--; if (cm < 0) { cm = 11; cy--; }
    renderCal();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    cm++; if (cm > 11) { cm = 0; cy++; }
    renderCal();
  });

  // Initial render
  renderCal();
});
