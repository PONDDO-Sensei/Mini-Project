const STORAGE_KEY = "todo_tasks_v1";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById("newTask");
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, done: false });
  input.value = "";
  save();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  save();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const filter = document.getElementById("filter").value;
  const q = document.getElementById("searchBox").value.toLowerCase();
  list.innerHTML = "";

  let filtered = tasks;
  if (filter === "active") filtered = tasks.filter(t => !t.done);
  if (filter === "done") filtered = tasks.filter(t => t.done);
  if (q) filtered = filtered.filter(t => t.text.toLowerCase().includes(q));

  if (filtered.length === 0) {
    list.innerHTML = `<li class="empty">ยังไม่มีงานในรายการ</li>`;
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";
    li.innerHTML = `
      <span onclick="toggleTask(${task.id})">${task.text}</span>
      <div>
        <button onclick="toggleTask(${task.id})">${task.done ? "↩" : "✔"}</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });
}

renderTasks();

document.getElementById("newTask").addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});
