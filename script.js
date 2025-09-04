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
  if (!confirm("ต้องการลบงานนี้หรือไม่?")) return;
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
}

function clearDone() {
  if (!confirm("ต้องการลบงานที่เสร็จแล้วทั้งหมดหรือไม่?")) return;
  tasks = tasks.filter(t => !t.done);
  save();
  renderTasks();
}

function editTask(id) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  li.classList.add("editing");
  const span = li.querySelector("span");
  const oldText = span.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;

  li.insertBefore(input, span);
  input.focus();

  function finishEdit() {
    const newText = input.value.trim();
    if (newText) {
      tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
      save();
    }
    renderTasks();
  }

  input.addEventListener("blur", finishEdit);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") finishEdit();
  });
}

function updateCounter() {
  const count = tasks.filter(t => !t.done).length;
  document.getElementById("counter").textContent = `งานคงเหลือ: ${count} งาน`;
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const filter = document.getElementById("filter").value;
  const sort = document.getElementById("sort").value;
  const q = document.getElementById("searchBox").value.toLowerCase();

  list.innerHTML = "";
  let filtered = tasks;

  if (filter === "active") filtered = tasks.filter(t => !t.done);
  if (filter === "done") filtered = tasks.filter(t => t.done);
  if (q) filtered = filtered.filter(t => t.text.toLowerCase().includes(q));

  if (sort === "newest") {
    filtered = [...filtered].sort((a, b) => b.id - a.id);
  } else if (sort === "oldest") {
    filtered = [...filtered].sort((a, b) => a.id - b.id);
  } else if (sort === "activeFirst") {
    filtered = [...filtered].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  }

  if (filtered.length === 0) {
    list.innerHTML = `<li class="empty">ยังไม่มีงานในรายการ</li>`;
    updateCounter();
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.className = task.done ? "done" : "";
    li.innerHTML = `
      <span ondblclick="editTask(${task.id})">${task.text}</span>
      <div>
        <button class="edit" onclick="editTask(${task.id})">✏️</button>
        <button onclick="toggleTask(${task.id})">${task.done ? "↩" : "✔"}</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });

  updateCounter();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

(function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
})();

renderTasks();

document.getElementById("newTask").addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});
