const api = "/api/todos";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");

async function loadTodos() {
  const response = await fetch(api);
  if (!response.ok) throw new Error("Failed to load todos");
  const todos = await response.json();
  todoList.innerHTML = "";
  todos.forEach(addTodoToPage);
}

function addTodoToPage(todo) {
  const li = document.createElement("li");
  const title = document.createElement("span");
  title.textContent = todo.title;
  if (todo.completed) title.classList.add("completed");

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    const response = await fetch(`${api}/${todo.id}`, { method: "DELETE" });
    if (!response.ok) {
      alert("Failed to delete todo");
      return;
    }
    loadTodos();
  });

  li.appendChild(title);
  li.appendChild(deleteButton);
  todoList.appendChild(li);
}

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;

  const response = await fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed: false })
  });

  if (!response.ok) {
    alert("Failed to create todo");
    return;
  }

  todoInput.value = "";
  loadTodos();
});

loadTodos();
