document.addEventListener('DOMContentLoaded',()=>{
  // 다크 모드
  const toggle=document.getElementById('darkModeToggle');
  if(localStorage.getItem('theme')==='dark') document.documentElement.setAttribute('data-theme','dark'),toggle.checked=true;
  toggle.addEventListener('change',()=>{
    if(toggle.checked){document.documentElement.setAttribute('data-theme','dark');localStorage.setItem('theme','dark');}
    else{document.documentElement.removeAttribute('data-theme');localStorage.setItem('theme','light');}
  });

  // To-Do
  const form=document.getElementById('taskForm'),input=document.getElementById('taskInput'),due=document.getElementById('dueInput'),
        prio=document.getElementById('priorityInput'),cat=document.getElementById('categoryInput'),
        activeList=document.getElementById('activeList'),completedList=document.getElementById('completedList'),
        countA=document.getElementById('countActive'),countC=document.getElementById('countCompleted'),
        TODO_KEY='todoTasks',FILTERS=document.querySelectorAll('.filters button'),search=document.getElementById('searchInput');
  let todos=[];
  function saveTodos(){localStorage.setItem(TODO_KEY,JSON.stringify(todos));updateLists();}
  function loadTodos(){todos=JSON.parse(localStorage.getItem(TODO_KEY)||'[]');saveTodos();}
  function updateCounts(){countA.textContent=todos.filter(t=>!t.done).length;countC.textContent=todos.filter(t=>t.done).length;}
  function filterAndRender(){const f=Array.from(FILTERS).find(b=>b.classList.contains('active')).dataset.filter;
    activeList.innerHTML=completedList.innerHTML='';
    todos.filter(t=>{
      if(f==='active'&&t.done)return false;
      if(f==='completed'&&!t.done)return false;
      if(f==='dueToday'){
        const today=new Date().toISOString().slice(0,10);
        if(t.due!==today) return false;
      }
      if(search.value&&!
        t.text.includes(search.value))return false;
      return true;
    }).forEach(t=>{
      const el=createTodoEl(t);
      (t.done?completedList:activeList).appendChild(el);
    });updateCounts();}
  function createTodoEl(t){const item=document.createElement('div');item.className=`task-item ${t.priority}`;
    item.draggable=true;
    item.innerHTML=`<span class="task-text">${t.text}</span><span class="task-meta">${t.due||''} ${t.category||''}</span>
      <div class="task-actions">
        ${t.done?'':'<button class="complete-btn"><i class="fas fa-check"></i></button>'}
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>`;
    if(!t.done)item.querySelector('.complete-btn').addEventListener('click',()=>{t.done=true;saveTodos();});
    item.querySelector('.delete-btn').addEventListener('click',()=>{todos=todos.filter(x=>x.id!==t.id);saveTodos();});
    // drag&drop
    item.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',t.id));
    return item;
  }
  form.addEventListener('submit',e=>{e.preventDefault();
    todos.push({id:Date.now(),text:input.value,done:false,due:due.value,priority:prio.value,category:cat.value});
    input.value='';due.value='';cat.value='';prio.value='medium';saveTodos();});
  // 필터 버튼
  FILTERS.forEach(b=>b.addEventListener('click',()=>{FILTERS.forEach(x=>x.classList.remove('active'));b.classList.add('active');filterAndRender();}));
  search.addEventListener('input',filterAndRender);
  // drag target
  [activeList,completedList].forEach(list=>{
    list.addEventListener('dragover',e=>e.preventDefault());
    list.addEventListener('drop',e=>{const id=Number(e.dataTransfer.getData('text/plain'));
      const t=todos.find(x=>x.id===id);if(list===completedList) t.done=true; else t.done=false; saveTodos();});
  });
  loadTodos();filterAndRender();

  // 푸시 알림 (만료일 오늘인 항목)
  if(Notification.permission==='default')Notification.requestPermission();
  if(Notification.permission==='granted'){
    const today=new Date().toISOString().slice(0,10);
    todos.filter(t=>!t.done&&t.due===today).forEach(t=>new Notification('오늘 기한', {body:t.text}));
  }

  // Calendar (省略: 이전 코드와 동일)
  const calGrid=document.getElementById('calendarGrid'),mY=document.getElementById('monthYear');
  let dt=new Date(),y=dt.getFullYear(),m=dt.getMonth();
  const CAL_KEY='calendarEvents';
  function loadCal(){return JSON.parse(localStorage.getItem(CAL_KEY)||'{}');}
  function saveCal(e){localStorage.setItem(CAL_KEY,JSON.stringify(e));}
  function renderCal(){calGrid.innerHTML='';const evs=loadCal();['일','월','화','수','목','금','토'].forEach(d=>{const dn=document.createElement('div');dn.className='day-name';dn.textContent=d;calGrid.appendChild(dn);} );
    const fd=new Date(y,m,1).getDay(),ld=new Date(y,m+1,0).getDate();
    for(let i=0;i<fd;i++){const e=document.createElement('div');e.className='day-cell inactive';calGrid.appendChild(e);}  
    for(let d=1;d<=ld;d++){const cell=document.createElement('div');cell.className='day-cell';const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cell.innerHTML=`<div class="date">${d}</div><div class="events"></div>`;
      (evs[key]||[]).forEach(txt=>{const ev=document.createElement('div');ev.className='event';ev.textContent=txt;cell.querySelector('.events').appendChild(ev);});
      cell.addEventListener('click',()=>{const t=prompt(`${key} 일정 입력`);if(!t)return;evs[key]=evs[key]||[];evs[key].push(t);saveCal(evs);renderCal();});
      calGrid.appendChild(cell);}  mY.textContent=`${y}년 ${m+1}월`;
  }
  document.getElementById('prevMonth').addEventListener('click',()=>{m--;if(m<0){m=11;y--;}renderCal();});
  document.getElementById('nextMonth').addEventListener('click',()=>{m++;if(m>11){m=0;y++;}renderCal();});
  renderCal();
});
