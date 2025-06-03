document.addEventListener('DOMContentLoaded', () => {
  const noteInput = document.getElementById('note-input');
  const addNoteBtn = document.getElementById('add-note-btn');
  const notesList = document.getElementById('notes-list');
  const offlineStatus = document.getElementById('offline-status');
  
  let currentlyEditingId = null;

  // Проверка онлайн-статуса
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Загрузка заметок при загрузке страницы
  loadNotes();
  
  // Добавление новой заметки
  addNoteBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    if (noteText) {
      if (currentlyEditingId !== null) {
        updateNote(currentlyEditingId, noteText);
        currentlyEditingId = null;
        addNoteBtn.textContent = 'Добавить заметку';
      } else {
        addNote(noteText);
      }
      noteInput.value = '';
    }
  });
  
  // Функция обновления статуса онлайн/офлайн
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineStatus.style.display = 'none';
    } else {
      offlineStatus.style.display = 'block';
    }
  }
  
  // Функция добавления заметки
  function addNote(text) {
    const notes = getNotes();
    const newNote = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    saveNotes(notes);
    renderNotes();
  }
  
  // Функция обновления заметки
  function updateNote(id, newText) {
    const notes = getNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex !== -1) {
      notes[noteIndex].text = newText;
      saveNotes(notes);
      renderNotes();
    }
  }
  
  // Функция удаления заметки
  function deleteNote(id) {
    const notes = getNotes().filter(note => note.id !== id);
    saveNotes(notes);
    renderNotes();
  }
  
  function getNotes() {
  const notesJSON = localStorage.getItem('notes');
  try {
    const notes = notesJSON ? JSON.parse(notesJSON) : [];
    // Фильтруем заметки, удаляя пустые или undefined
    return notes.filter(note => note && note.text && note.text.trim() !== '');
  } catch (e) {
    console.error('Ошибка при чтении заметок:', e);
    return [];
  }
  }
  
  // Функция сохранения заметок
  function saveNotes(notes) {
    localStorage.setItem('notes', JSON.stringify(notes));
  }
  
  // Функция загрузки заметок
  function loadNotes() {
    renderNotes();
  }
  
  // Функция отрисовки заметок
  function renderNotes() {
    const notes = getNotes();
    
    if (notes.length === 0) {
      notesList.innerHTML = '<p class="empty-notes">Заметок пока нет</p>';
      return;
    }
    
    notesList.innerHTML = notes.map(note => `
      <div class="note-card" data-id="${note.id}">
        <div class="note-content">${note.text}</div>
        <div class="edit-form">
          <textarea class="edit-textarea">${note.text}</textarea>
          <div class="edit-form-btns">
            <button class="save-edit-btn">Сохранить</button>
            <button class="cancel-edit-btn">Отмена</button>
          </div>
        </div>
        <div class="note-actions">
          <button class="edit-btn" data-id="${note.id}">Редактировать</button>
          <button class="delete-btn" data-id="${note.id}">Удалить</button>
        </div>
      </div>
    `).join('');
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        deleteNote(id);
      });
    });
    
    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        startEditingNote(id);
      });
    });
    
    // Добавляем обработчики для кнопок сохранения редактирования
    document.querySelectorAll('.save-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteCard = e.target.closest('.note-card');
        const id = parseInt(noteCard.getAttribute('data-id'));
        const editTextarea = noteCard.querySelector('.edit-textarea');
        updateNote(id, editTextarea.value.trim());
      });
    });
    
    // Добавляем обработчики для кнопок отмены редактирования
    document.querySelectorAll('.cancel-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteCard = e.target.closest('.note-card');
        toggleEditForm(noteCard, false);
      });
    });
  }
  
  // Функция начала редактирования заметки
  function startEditingNote(id) {
    const notes = getNotes();
    const note = notes.find(note => note.id === id);
    
    if (note) {
      currentlyEditingId = id;
      noteInput.value = note.text;
      noteInput.focus();
      addNoteBtn.textContent = 'Сохранить изменения';
      
      // Прокрутка к полю ввода
      noteInput.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Функция переключения формы редактирования
  function toggleEditForm(noteCard, show) {
    const noteContent = noteCard.querySelector('.note-content');
    const editForm = noteCard.querySelector('.edit-form');
    const noteActions = noteCard.querySelector('.note-actions');
    
    if (show) {
      noteContent.style.display = 'none';
      editForm.style.display = 'block';
      noteActions.style.display = 'none';
    } else {
      noteContent.style.display = 'block';
      editForm.style.display = 'none';
      noteActions.style.display = 'flex';
    }
  }
  
  // Регистрация Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('ServiceWorker registration successful');
      }).catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
});