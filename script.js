const input = document.getElementById("newInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const countEl = document.getElementById("count");
const filters = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clearCompleted");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");

let todos = [];
let filter = "all";

function save() {
  localStorage.setItem("todos:v1", JSON.stringify(todos));
}

function load() {
  const raw = localStorage.getItem("todos:v1");
  todos = raw ? JSON.parse(raw) : [];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function render() {
  listEl.innerHTML = "";

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  emptyState.hidden = filtered.length !== 0;

  filtered.forEach((t) => {
    const li = document.createElement("li");
    li.className = t.done ? "completed" : "";
    li.dataset.id = t.id;

    const tick = document.createElement("div");
    tick.className = "tick";
    tick.innerHTML = t.done ? "✓" : "";
    tick.onclick = () => toggleDone(t.id);

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = t.text;
    label.ondblclick = () => startEdit(t.id);

    const meta = document.createElement("div");
    meta.className = "meta";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => startEdit(t.id);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => removeTodo(t.id);

    meta.append(editBtn, delBtn);
    li.append(tick, label, meta);
    listEl.appendChild(li);
  });

  countEl.textContent = todos.filter((t) => !t.done).length;
  save();
}

function addTodo(text) {
  text = text.trim();
  if (!text) return;
  todos.unshift({ id: uid(), text, done: false });
  input.value = "";
  render();
}

function toggleDone(id) {
  const t = todos.find((x) => x.id === id);
  if (t) t.done = !t.done;
  render();
}

function removeTodo(id) {
  todos = todos.filter((x) => x.id !== id);
  render();
}

function startEdit(id) {
  const li = listEl.querySelector(`[data-id='${id}']`);
  const label = li.querySelector(".label");

  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.value = label.textContent;

  const finish = () => {
    const val = inputEdit.value.trim();
    if (val) {
      const t = todos.find((x) => x.id === id);
      t.text = val;
    } else {
      todos = todos.filter((x) => x.id !== id);
    }
    render();
  };

  inputEdit.onkeydown = (e) => {
    if (e.key === "Enter") finish();
    if (e.key === "Escape") render();
  };
  inputEdit.onblur = finish;

  label.replaceWith(inputEdit);
  inputEdit.focus();
}

filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  })
);

clearCompletedBtn.onclick = () => {
  todos = todos.filter((t) => !t.done);
  render();
};

addBtn.onclick = () => addTodo(input.value);
input.onkeydown = (e) => {
  if (e.key === "Enter") addTodo(input.value);
};

// Export / Import
exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos.json";
  a.click();
  URL.revokeObjectURL(url);
};

importBtn.onclick = () => fileInput.click();
fileInput.onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const txt = await f.text();
  try {
    const parsed = JSON.parse(txt);
    if (Array.isArray(parsed)) {
      todos = parsed.map((x) => ({
        id: x.id || uid(),
        text: String(x.text || ""),
        done: Boolean(x.done),
      }));
      render();
    } else alert("Invalid file");
  } catch {
    alert("Error importing file");
  }
  fileInput.value = "";
};

// Initialize
load();
render();

