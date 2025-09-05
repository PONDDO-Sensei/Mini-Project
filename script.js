const STORAGE_KEY = "todo_tasks_v1";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

let currentFilter = "all";
let currentSort = "newest";
1

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask() {
    const input = document.getElementById("newTask");
    const deadlineInput = document.getElementById("deadline");
    const text = input.value.trim();
    const deadline = deadlineInput.value;

    if (!text) return;

    tasks.unshift({
        id: Date.now(),
        text,
        done: false,
        deadline: deadline || null
    });

    input.value = "";
    deadlineInput.value = "";
    save();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, done: !t.done } : t);
    save();
    renderTasks();
}

function deleteTask(id) {
    if (!confirm("Are you sure to delete this task?")) return;
    tasks = tasks.filter(t => t.id !== id);
    save();
    renderTasks();
}

function clearDone() {
    if (!confirm("Are you sure to clear all completed tasks?")) return;
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
            tasks = tasks.map(t => t.id === id ? {...t, text: newText } : t);
            save();
        }
        renderTasks();
    }

    input.addEventListener("blur", finishEdit);
    input.addEventListener("keypress", e => { if (e.key === "Enter") finishEdit(); });
}

function updateCounter() {
    const count = tasks.filter(t => !t.done).length;
    document.getElementById("counter").textContent = `Tasks left: ${count}`;
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
    document.getElementById("filter-" + filter).classList.add("active");
    renderTasks();
}

function setSort(sort) {
    currentSort = sort;
    document.querySelectorAll(".sorts button").forEach(btn => btn.classList.remove("active"));
    document.getElementById("sort-" + sort).classList.add("active");
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    const query = document.getElementById("searchBox").value.trim().toLowerCase();

    list.innerHTML = "";
    let filtered = tasks;

    if (currentFilter === "active") filtered = tasks.filter(t => !t.done);
    if (currentFilter === "done") filtered = tasks.filter(t => t.done);

    // Search: text or partial date
    if (query) {
        filtered = filtered.filter(t => {
            const textMatch = t.text.toLowerCase().includes(query);
            const dateMatch = t.deadline && t.deadline.includes(query);
            return textMatch || dateMatch;
        });
    }

    // Sort
    if (currentSort === "newest") filtered = [...filtered].sort((a, b) => b.id - a.id);
    else if (currentSort === "oldest") filtered = [...filtered].sort((a, b) => a.id - b.id);
    else if (currentSort === "activeFirst") filtered = [...filtered].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));

    if (filtered.length === 0) {
        list.innerHTML = `<li class="empty">No tasks found</li>`;
        updateCounter();
        return;
    }

    filtered.forEach(task => {
                const li = document.createElement("li");
                li.dataset.id = task.id;
                li.className = task.done ? "done" : "";

                let textContent = task.text;
                let deadlineContent = task.deadline ? `⏰ ${task.deadline}` : "";

                if (query) {
                    if (task.text.toLowerCase().includes(query)) {
                        const regex = new RegExp(`(${query})`, "gi");
                        textContent = task.text.replace(regex, "<mark>$1</mark>");
                    }
                    if (task.deadline && task.deadline.includes(query)) {
                        const regex = new RegExp(`(${query})`, "gi");
                        deadlineContent = `⏰ ${task.deadline.replace(regex, "<mark>$1</mark>")}`;
                    }
                }

                li.innerHTML = `
      <span ondblclick="editTask(${task.id})">${textContent}</span>
      ${deadlineContent ? `<small>${deadlineContent}</small>` : ""}
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
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

(function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
})();

renderTasks();

document.getElementById("newTask").addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});