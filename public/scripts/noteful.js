/* global $ store api*/
'use strict';

const noteful = (function () {

  function render() {
    console.log(store.currentNote);
    const notesList = generateNotesList(store.notes, store.currentNote);
    $('.js-notes-list').html(notesList);
    const editForm = $('.js-note-edit-form');
    editForm.find('.js-note-title-entry').val(store.currentNote.title);
    editForm.find('.js-note-content-entry').val(store.currentNote.content);
  }

  /**
   * GENERATE HTML FUNCTIONS
   */
  function generateNotesList(list, currentNote) {
    const listItems = list.map(item => `
    <li data-id="${item.id}" class="js-note-element ${currentNote.id === item.id ? 'active' : ''}">
      <a href="#" class="name js-note-show-link">${item.title}</a>
    <button class="removeBtn js-note-delete-button">X</button>
      </li>`);
    return listItems.join('');
  }

  /**
   * HELPERS
   */
  function getNoteIdFromElement(item) {
    const id = $(item).closest('.js-note-element').data('id');
    return id;
  }
  
  function findAndDelete(id) {
    store.notes = store.notes.filter(notes => notes.id !== id);
  }

  function searchAndUpdate() {
    api.search(store.currentSearchTerm)
      .then(updateResult => {
        store.notes = updateResult;
        render();
      });
  }

  /**
   * EVENT LISTENERS AND HANDLERS
   */
  //Added Promise - Works
  function handleNoteItemClick() {
    $('.js-notes-list').on('click', '.js-note-show-link', event => {
      event.preventDefault();
      console.log('clicking');
      const noteId = getNoteIdFromElement(event.currentTarget);

      api.details(noteId).then(result => {
        console.log(result);
        store.currentNote = result;
        render();
      });
    });
  }

  //Added promise - Works
  function handleNoteSearchSubmit() {
    $('.js-notes-search-form').on('submit', event => {
      event.preventDefault();
      
      const searchTerm = $('.js-note-search-entry').val();
      store.currentSearchTerm =  searchTerm ? { searchTerm } : {};
      
      api.search(store.currentSearchTerm).then(result => {
        store.notes = result;
        render();
      }); 
    });
  }
  
  //Added promise - Works?
  function handleNoteFormSubmit() {
    $('.js-note-edit-form').on('submit', function (event) {
      event.preventDefault();
      
      const editForm = $(event.currentTarget);
      
      const noteObj = {
        id: store.currentNote.id,
        title: editForm.find('.js-note-title-entry').val(),
        content: editForm.find('.js-note-content-entry').val(),
      };
      if (store.currentNote.id) {
        api.update(store.currentNote.id, noteObj)
          .then(updateResult => {
            store.currentNote = updateResult;
            searchAndUpdate();
          });
      } else {
        api.create(noteObj).then(updateResult => {
          store.notes = updateResult;
          searchAndUpdate();
        });}
    });
  }
  
  
  function handleNoteStartNewSubmit() {
    $('.js-start-new-note-form').on('submit', event => {
      event.preventDefault();
      store.currentNote = false;
      render();
    });
  }

  
  //Added promise - works?
  function handleDelete() {
    $('.js-notes-list').on('click', '.js-note-delete-button', event => {
      console.log('delete button clicked');
      const id = getNoteIdFromElement(event.currentTarget);
      console.log(`id is ${id}`);
      api.delete(id)
        .then(() => {
          searchAndUpdate();
          render();
        });
    });
  }

  function bindEventListeners() {
    handleNoteItemClick();
    handleNoteSearchSubmit();
    handleNoteFormSubmit();
    handleNoteStartNewSubmit();
    handleDelete();
  }
  
  // This object contains the only exposed methods from this module:
  return {
    searchAndUpdate,
    render,
    bindEventListeners
  };
  
}());
