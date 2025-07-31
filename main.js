document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const todo = document.querySelector(".todo");
  const progressBar = document.getElementById("progress");
  const progressNumbers = document.getElementById("numbers");

  let taskBeingEdited = null;

  const createIcon = (className) => {
    const icon = document.createElement("i");
    icon.className = className;
    return icon;
  };
  const plusIcon = createIcon("fa-solid fa-plus");
  const saveIcon = createIcon("fa-solid fa-floppy-disk");

  const setAddButtonIcon = (icon) => {
    addTaskBtn.textContent = "";
    addTaskBtn.appendChild(icon);
  };

  const toggleEmptyState = () => {
    todo.style.width = taskList.children.length > 0 ? "100%" : "50%";
  };

  const updateProgress = () => {
    const totalTasks = taskList.children.length;
    const completedTasks = taskList.querySelectorAll(
      ".todo__list-checkbox:checked"
    ).length;

    progressBar.style.width = totalTasks
      ? `${(completedTasks / totalTasks) * 100}%`
      : "0%";

    progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

    if (totalTasks > 0 && completedTasks === totalTasks) {
      shootConfetti();
    }
  };

  const saveTasksToLocalStorage = () => {
    const tasks = Array.from(taskList.children).map((li) => ({
      text: li.querySelector(".todo__list-text").textContent,
      completed: li.querySelector(".todo__list-checkbox").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const loadTasksFromLocalStorage = () => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      savedTasks.forEach(({ text, completed }) => {
        addTask(text, completed, false);
      });
      toggleEmptyState();
      updateProgress();
    } catch {
      console.warn("Ошибка при загрузке задач из localStorage");
    }
  };

  const createTaskElement = (text, completed) => {
    const li = document.createElement("li");

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "todo__list-checkbox";
    checkBox.checked = completed;

    const span = document.createElement("span");
    span.className = "todo__list-text";
    span.textContent = text;

    const controls = document.createElement("div");
    controls.className = "todo__task-controls";

    const editBtn = document.createElement("button");
    editBtn.className = "todo__task-controls-btn todo__task-controls-btn--edit";
    editBtn.title = "Edit task";
    editBtn.appendChild(createIcon("fa-solid fa-pen"));

    const deleteBtn = document.createElement("button");
    deleteBtn.className =
      "todo__task-controls-btn todo__task-controls-btn--delete";
    deleteBtn.title = "Delete task";
    deleteBtn.appendChild(createIcon("fa-solid fa-trash"));

    controls.append(editBtn, deleteBtn);
    li.append(checkBox, span, controls);

    if (completed) {
      li.classList.add("todo__list-item--completed");
      editBtn.disabled = true;
    }

    return li;
  };

  const addTask = (text = "", completed = false) => {
    const taskText = text || taskInput.value.trim();
    if (!taskText) return;

    if (taskBeingEdited) {
      const span = taskBeingEdited.querySelector(".todo__list-text");
      span.textContent = taskText;
      taskBeingEdited = null;
      setAddButtonIcon(plusIcon);
      taskInput.value = "";
      toggleEmptyState();
      updateProgress();
      saveTasksToLocalStorage();
      return;
    }

    const li = createTaskElement(taskText, completed);
    taskList.appendChild(li);

    taskInput.value = "";
    toggleEmptyState();
    updateProgress();
    saveTasksToLocalStorage();
  };

  taskList.addEventListener("click", (event) => {
    const li = event.target.closest("li");
    if (!li) return;

    if (event.target.closest(".todo__task-controls-btn--edit")) {
      if (li.querySelector(".todo__list-checkbox").checked) return;
      taskBeingEdited = li;
      taskInput.value = li.querySelector(".todo__list-text").textContent;
      taskInput.focus();
      setAddButtonIcon(saveIcon);
    }

    if (event.target.closest(".todo__task-controls-btn--delete")) {
      if (taskBeingEdited === li) {
        taskBeingEdited = null;
        setAddButtonIcon(plusIcon);
        taskInput.value = "";
      }
      li.remove();
      toggleEmptyState();
      updateProgress();
      saveTasksToLocalStorage();
    }
  });

  taskList.addEventListener("change", (event) => {
    if (event.target.classList.contains("todo__list-checkbox")) {
      const li = event.target.closest("li");
      const isChecked = event.target.checked;

      li.classList.toggle("todo__list-item--completed", isChecked);
      li.querySelector(".todo__task-controls-btn--edit").disabled = isChecked;

      updateProgress();
      saveTasksToLocalStorage();
    }
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    addTask();
  };

  addTaskBtn.addEventListener("click", handleAddTask);

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleAddTask(e);
    }
  });

  setAddButtonIcon(plusIcon);
  loadTasksFromLocalStorage();
  updateProgress();
  toggleEmptyState();
});

function shootConfetti() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ["star"],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}
