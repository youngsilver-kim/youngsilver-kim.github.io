document.addEventListener('DOMContentLoaded', () => {
  // —— 기존 To-Do 로직 —— (省略 가능)
  // …loadTasks(), saveTasks(), makeTask(), form 이벤트 등…

  // —— 달력 로직 ——  
  const calendarGrid = document.getElementById('calendarGrid');
  const monthYearEl = document.getElementById('monthYear');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const CAL_KEY = 'calendarEvents';

  let today = new Date();
  let curYear = today.getFullYear();
  let curMonth = today.getMonth();

  function loadCalEvents() {
    const raw = localStorage.getItem(CAL_KEY);
    return raw ? JSON.parse(raw) : {};
  }
  function saveCalEvents(events) {
    localStorage.setItem(CAL_KEY, JSON.stringify(events));
  }

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const events = loadCalEvents();
    // 요일 헤더
    ['일','월','화','수','목','금','토'].forEach(d => {
      const dn = document.createElement('div');
      dn.className = 'day-name';
      dn.textContent = d;
      calendarGrid.appendChild(dn);
    });
    // 1일 요일, 말일 계산
    const firstDay = new Date(curYear, curMonth, 1).getDay();
    const lastDate = new Date(curYear, curMonth+1, 0).getDate();
    // 빈 칸
    for (let i=0; i<firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day-cell inactive';
      calendarGrid.appendChild(empty);
    }
    // 날짜 셀
    for (let d=1; d<=lastDate; d++) {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      const key = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cell.innerHTML = `
        <div class="date">${d}</div>
        <div class="events"></div>
      `;
      // 기존 이벤트 렌더
      (events[key]||[]).forEach(txt => {
        const ev = document.createElement('div');
        ev.className = 'event';
        ev.textContent = txt;
        cell.querySelector('.events').appendChild(ev);
      });
      // 클릭 시 일정 추가
      cell.addEventListener('click', () => {
        const text = prompt(`${key} 일정 입력`);
        if (!text) return;
        events[key] = events[key]||[];
        events[key].push(text);
        saveCalEvents(events);
        renderCalendar();
      });
      calendarGrid.appendChild(cell);
    }
    monthYearEl.textContent = `${curYear}년 ${curMonth+1}월`;
  }

  prevBtn.addEventListener('click', () => {
    curMonth--;
    if (curMonth<0) { curMonth=11; curYear--; }
    renderCalendar();
  });
  nextBtn.addEventListener('click', () => {
    curMonth++;
    if (curMonth>11) { curMonth=0; curYear++; }
    renderCalendar();
  });

  // 초기 렌더
  renderCalendar();
});
