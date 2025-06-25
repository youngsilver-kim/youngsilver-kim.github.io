document.addEventListener('DOMContentLoaded', () => {
  const form           = document.getElementById('taskForm');
  const input          = document.getElementById('taskInput');
  const activeTasks    = document.getElementById('activeTasks');
  const completedTasks = document.getElementById('completedTasks');
  const activeCount    = document.getElementById('activeCount');
  const completedCount = document.getElementById('completedCount');

  function updateCounts() {
    activeCount.textContent    = activeTasks.children.length;
    completedCount.textContent = completedTasks.children.length;
  }

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
    item.querySelector('.complete-btn')
        .addEventListener('click', () => {
          completedTasks.appendChild(item);
          item.querySelector('.complete-btn').remove();
          updateCounts();
        });
    item.querySelector('.delete-btn')
        .addEventListener('click', () => {
          item.remove();
          updateCounts();
        });
    return item;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    activeTasks.appendChild(makeTask(text));
    input.value = '';
    updateCounts();
  });
});
