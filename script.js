// Ambil elemen penting
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const toggleDark = document.getElementById('toggle-dark');

// Modal elemen
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalOk = document.getElementById('modal-ok');
const modalCancel = document.getElementById('modal-cancel');

// Toast notifikasi
const toast = document.getElementById('toast');

let modalCallback = null;
let currentEditIndex = null;

// Data awal
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';


// Render semua tugas
function renderTasks() {
  list.innerHTML = '';

  const filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filtered.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-xl transition-all duration-300';

    // Teks tugas
    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = 'flex-1 cursor-pointer';
    if (task.completed) {
      span.classList.add('line-through', 'text-gray-400');
    }

    // Tombol aksi
    const buttons = document.createElement('div');
    buttons.className = 'flex gap-2 items-center';

    // ✅ Toggle selesai
    const doneBtn = document.createElement('button');
    doneBtn.innerHTML = task.completed ? '✅' : '⬜';
    doneBtn.title = task.completed ? 'Tandai belum selesai' : 'Tandai selesai';
    doneBtn.onclick = () => {
      clickSound.play();
      toggleComplete(index);
    };

    // ✏️ Edit
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit';
    editBtn.onclick = () => {
      clickSound.play();
      editTask(index);
    };

    // 🗑️ Hapus
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '🗑️';
    delBtn.title = 'Hapus';
    delBtn.onclick = () => {
      clickSound.play();
      deleteTask(index);
    };

    buttons.appendChild(doneBtn);
    buttons.appendChild(editBtn);
    buttons.appendChild(delBtn);

    li.appendChild(span);
    li.appendChild(buttons);
    list.appendChild(li);
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Tambah tugas
form.onsubmit = function (e) {
  e.preventDefault();
  const text = input.value.trim();
  if (text !== '') {
    tasks.push({ text, completed: false });
    input.value = '';
    clickSound.play();
    renderTasks();
  }
};

// Tandai selesai
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}

// Edit tugas (pakai modal)
function editTask(index) {
  currentEditIndex = index;
  showModal('Edit Tugas', tasks[index].text, newText => {
    if (newText.trim() !== '') {
      tasks[index].text = newText.trim();
      renderTasks();
      showToast('✅ Tugas berhasil diedit!');
    }
  }, false);
}

// Hapus tugas (pakai modal)
function deleteTask(index) {
  showModal('Yakin ingin menghapus tugas ini?', '', () => {
    tasks.splice(index, 1);
    renderTasks();
    showToast('🗑️ Tugas berhasil dihapus!');
  }, true);
}

// Filter tampilan tugas
filterButtons.forEach(button => {
  button.onclick = () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.remove('font-bold', 'text-blue-600', 'dark:text-yellow-400'));
    button.classList.add('font-bold', 'text-blue-600', 'dark:text-yellow-400');
    clickSound.play();
    renderTasks();
  };
});

// Toggle Dark Mode
toggleDark.onclick = () => {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    toggleDark.innerHTML = '🌙 Dark Mode';
    localStorage.setItem('darkMode', false);
  } else {
    html.classList.add('dark');
    toggleDark.innerHTML = '☀️ Light Mode';
    localStorage.setItem('darkMode', true);
  }
};

// Aktifkan dark mode jika sebelumnya dipilih
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
  toggleDark.innerHTML = '☀️ Light Mode';
}

// Modal: tampilkan
function showModal(title, defaultValue, callback, isDelete = false) {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 50);

  modalTitle.textContent = title;
  modalCallback = callback;

  if (isDelete) {
    modalInput.classList.add('hidden');
    modalOk.textContent = 'Hapus';
    modalOk.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    modalOk.classList.add('bg-red-500', 'hover:bg-red-600');
  } else {
    modalInput.classList.remove('hidden');
    modalInput.value = defaultValue || '';
    modalOk.textContent = 'Simpan';
    modalOk.classList.remove('bg-red-500', 'hover:bg-red-600');
    modalOk.classList.add('bg-blue-500', 'hover:bg-blue-600');
  }
}

// Modal: sembunyikan
function hideModal() {
  modalContent.classList.remove('scale-100', 'opacity-100');
  setTimeout(() => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }, 200);
}

// Tombol modal
modalOk.onclick = () => {
  const value = modalInput.value;
  hideModal();
  if (modalCallback) modalCallback(value);
};

modalCancel.onclick = () => {
  hideModal();
};

// Toast notifikasi
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('opacity-100');

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('hidden');
    }, 300);
  }, 2000);
}

// Pertama kali tampil
renderTasks();
