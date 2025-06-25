document.addEventListener('DOMContentLoaded', () => {
  const form           = document.getElementById('taskForm');
  const input          = document.getElementById('taskInput');
  const activeTasks    = document.getElementById('activeTasks');
  const completedTasks = document.getElementById('completedTasks');
  const activeCount    = document.getElementById('activeCount');
  const completedCount = document.getElementById('completedCount');
  const STORAGE_KEY    = 'todoTasks';

  // 저장된 작업 불러오기
  function loadTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    JSON.parse(data).forEach(item => {
      const task = makeTask(item.text);
      if (item.done) {
        // 완료된 상태로 복원
        task.querySelector('.complete-btn').remove();
        completedTasks.appendChild(task);
      } else {
        activeTasks.appendChild(task);
      }
    });
    updateCounts();
  }

  // 현재 작업을 로컬스토리지에 저장
  function saveTasks() {
    const tasks = [];
    // 진행 중인 작업
    for (let el of activeTasks.children) {
      tasks.push({ text: el.querySelector('.task-text').textContent, done: false });
    }
    // 완료된 작업
    for (let el of completedTasks.children) {
      tasks.push({ text: el.querySelector('.task-text').textContent, done: true });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  // 통계 숫자 업데이트
  function updateCounts() {
    activeCount.textContent    = activeTasks.children.length;
    completedCount.textContent = completedTasks.children.length;
  }

  // 작업 요소 생성 및 이벤트 연결
  function makeTask(text) {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.innerHTML = `
      <span class="task-text">${text}</span>
      <div class="task-actions">
        <button class="complete-btn"><i class="fas fa-check"></i></button>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;
    // 완료 버튼 클릭 시
    item.querySelector('.complete-btn')
      .addEventListener('click', () => {
        completedTasks.appendChild(item);
        item.querySelector('.complete-btn').remove();
        updateCounts();
        saveTasks();
      });
    // 삭제 버튼 클릭 시
    item.querySelector('.delete-btn')
      .addEventListener('click', () => {
        item.remove();
        updateCounts();
        saveTasks();
      });
    return item;
  }

  // 새 작업 등록 처리
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    activeTasks.appendChild(makeTask(text));
    input.value = '';
    updateCounts();
    saveTasks();
  });

  // 초기 로드 시 한 번 실행
  loadTasks();
});
