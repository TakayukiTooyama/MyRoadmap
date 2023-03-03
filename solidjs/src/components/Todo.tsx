import { createSignal, For } from 'solid-js';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export const Todo = () => {
  const [taskList, setTaskList] = createSignal<Task[]>([]);

  const addTask = (e: Event) => {
    e.preventDefault();
    const taskInput = document.querySelector('#taskInput') as HTMLInputElement;
    const newTask: Task = {
      id: Math.random().toString(36).substring(2),
      text: taskInput.value,
      completed: false,
    };
    setTaskList([newTask, ...taskList()]);
    taskInput.value = '';
  };

  const deleteTask = (taskId: string) => {
    const newTaskList = taskList().filter(task => task.id !== taskId);
    setTaskList(newTaskList);
  };

  const toggleStatus = (taskId: string) => {
    const newTaskList = taskList().map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTaskList(newTaskList);
  };

  return (
    <div class="container mt-5 text-center">
      <h1 class="text-5xl mb-4">Task Manager</h1>

      <form class="mb-5 flex justify-center" onSubmit={addTask}>
        <input
          type="text"
          class="input-group-text p-1 w-25"
          placeholder="Add task here..."
          id="taskInput"
          required
        />

        <button class="px-2 border-2 border-black hover:bg-gray-50 rounded-md" type="submit">
          +
        </button>
      </form>

      <div>
        <h4 class="text-muted mb-4">Tasks</h4>
        <For each={taskList()}>
          {(task: Task) => (
            <div class="row row-cols-3 mb-3 justify-content-center">
              <button class="btn btn-danger w-auto" onClick={() => deleteTask(task.id)}>
                X
              </button>
              <div class={`bg-light p-2 mx-2 ${task.completed && 'line-through text-gray-300'}`}>
                {task.text}
              </div>
              <input
                checked={task.completed}
                type="checkbox"
                role="button"
                class="form-check-input h-auto px-3"
                onInput={() => {
                  toggleStatus(task.id);
                }}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
