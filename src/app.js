import 'bootstrap';
import onChange from 'on-change';
import i18next from 'i18next';
import { setLocale } from 'yup';
import './style.scss';
import validate from './validator.js';
import render from './view.js';
import resources from './locales/index.js';

const DEFAULT_LANGUAGE = 'ru';

export default () => {
  const elements = getElements();
  const i18nextInstance = i18next.createInstance();

  i18nextInstance
    .init({
      lng: DEFAULT_LANGUAGE,
      debug: false,
      resources,
    })
    .then(() => {
      setLocale({
        mixed: {
          default: i18nextInstance.t('validation.default'),
          notOneOf: i18nextInstance.t('validation.notOneOf'),
        },
        string: {
          required: i18nextInstance.t('validation.required'),
          url: i18nextInstance.t('validation.invalidUrl'),
        },
      });

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
    });
};

const getElements = () => ({
  formEl: document.querySelector('.rss-form'),
  inputEl: document.querySelector('#url-input'),
  feedbackEl: document.querySelector('.feedback'),
});

const state = {
  status: '',
  errors: '',
  urls: [],
};
