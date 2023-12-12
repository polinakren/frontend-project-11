import 'bootstrap';
import onChange from 'on-change';
import './style.scss';
import validate from './validator.js';
import render from './view.js';

export default () => {
  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.querySelector('#url-input'),
  };

  const state = {
    status: '',
    errors: '',
    urls: [],
  };

  const watchedState = onChange(state, render(elements));

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(url, state.urls)
      .then(() => {
        watchedState.errors = '';
        watchedState.status = 'valid';
        watchedState.urls.push(url);
      })
      .catch((error) => {
        watchedState.errors = error.message;
        watchedState.status = 'invalid';
      })
      .then(() => console.log(state));
  });
};
