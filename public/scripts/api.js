

/* global $ */
'use strict';

const api = {
  
  search: function (query) {
    return  $.ajax({
      type: 'GET',
      url: '/v1/notes/',
      dataType: 'json',
      data: query
    });
  },

  create: function (obj) {
    return $.ajax({
      type: 'POST',
      url: '/v1/notes',
      contentType: 'application/json',
      dataType: 'json',
      processData: false,
      data: JSON.stringify(obj)
    });
  },
  
  details: function (id) {
    console.log(id);
    return $.ajax({
      type: 'GET',
      dataType: 'json',
      url: `/v1/notes/${id}`
    });
  },
  
  update: function (id, obj) {
    return $.ajax({
      type: 'PUT',
      url: `/v1/notes/${id}`,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(obj)
    });
  },

  delete: function (id) {
    return  $.ajax ({
      type: 'DELETE',
      url: `/v1/notes/${id}`,
      contentType: 'application/json'
    });
  }
}; 
