document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const todosContainer = document.querySelector(".todos-container");
  const progressBar = document.getElementById("progress");
  const progressNumbers = document.getElementById("numbers");

  let taskBeingEdited = null;

  const toggleEmptyState = () => {
    todosContainer.style.width = taskList.children.length > 0 ? "100%" : "50%";
  };

  const updateProgress = () => {
    const totalTasks = taskList.children.length;
    const completedTasks = taskList.querySelectorAll(".checkbox:checked").length;

    progressBar.style.width = totalTasks
      ? `${(completedTasks / totalTasks) * 100}%`
      : "0%";

    progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

    if (totalTasks > 0 && completedTasks === totalTasks) {
      shootConfetti();
    }
  };

  const loadTasksFromLocalStorage = () => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      savedTasks.forEach(({ text, completed }) => {
        addTask(text, completed, false);
      });
      toggleEmptyState();
      updateProgress();
    } catch (error) {
      console.log("Ошибка при загрузке задач из localStorage:", error);
    }
  };

  const saveTasksToLocalStorage = () => {
    const tasks = Array.from(taskList.querySelectorAll("li")).map((li) => ({
      text: li.querySelector("span").textContent,
      completed: li.querySelector(".checkbox").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const addTask = (text = "", completed = false) => {
    const taskText = text || taskInput.value.trim();
    if (!taskText) return;

    if (taskBeingEdited) {
      const span = taskBeingEdited.querySelector("span");
      span.textContent = taskText;
      taskBeingEdited = null;
      addTaskBtn.textContent = "";
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-plus";
      addTaskBtn.appendChild(icon);
      taskInput.value = "";
      toggleEmptyState();
      updateProgress();
      saveTasksToLocalStorage();
      return;
    }

    const li = document.createElement("li");

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "checkbox";
    checkBox.checked = completed;

    const span = document.createElement("span");
    span.textContent = taskText;

    const div = document.createElement("div");
    div.className = "task-controls";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";

    const editIcon = document.createElement("i");
    editIcon.className = "fa-solid fa-pen";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash";

    li.appendChild(checkBox);
    li.appendChild(span);

    div.appendChild(editBtn);
    editBtn.appendChild(editIcon);

    div.appendChild(deleteBtn);
    deleteBtn.appendChild(deleteIcon);

    li.appendChild(div);

    taskList.appendChild(li);

    if (completed) {
      li.classList.add("completed");
      editBtn.disabled = true;
    }

    checkBox.addEventListener("change", () => {
      const isChecked = checkBox.checked;
      li.classList.toggle("completed", isChecked);
      editBtn.disabled = isChecked;
      updateProgress();
      saveTasksToLocalStorage();
    });

    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!checkBox.checked) {
        taskBeingEdited = li;
        taskInput.value = span.textContent;
        taskInput.focus();
        addTaskBtn.textContent = "";
        const saveIcon = document.createElement("i");
        saveIcon.className = "fa-solid fa-floppy-disk";
        addTaskBtn.appendChild(saveIcon);
      }
    });

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (taskBeingEdited === li) {
        taskBeingEdited = null;
        addTaskBtn.textContent = "";
        const plusIcon = document.createElement("i");
        plusIcon.className = "fa-solid fa-plus";
        addTaskBtn.appendChild(plusIcon);
        taskInput.value = "";
      }
      li.remove();
      toggleEmptyState();
      updateProgress();
      saveTasksToLocalStorage();
    });

    taskInput.value = "";
    toggleEmptyState();
    updateProgress();
    saveTasksToLocalStorage();
  };

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
  updateProgress();

  loadTasksFromLocalStorage();
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
