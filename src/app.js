import 'bootstrap';
import onChange from 'on-change';
import i18next from 'i18next';
import { setLocale } from 'yup';
import './style.scss';
import validate from './validator.js';
import render from './view.js';
import resources from './locales/index.js';
import getDataFromUrl from './getDataFromUrl.js';
import parseDataFromUrl from './parseDataFromUrl.js';

const DEFAULT_LANGUAGE = 'ru';

const elements = {
  formEl: document.querySelector('.rss-form'),
  inputEl: document.querySelector('#url-input'),
  feedbackEl: document.querySelector('.feedback'),
  feedsEl: document.querySelector('.feeds'),
  postsEl: document.querySelector('.posts'),
};

const state = {
  status: '',
  errors: '',
  feeds: [],
  posts: [],
};

const initializeI18next = () => {
  const i18nextInstance = i18next.createInstance();

  return i18nextInstance
    .init({
      lng: DEFAULT_LANGUAGE,
      debug: false,
      resources,
    })
    .then(() => {
      setLocale({
        mixed: {
          default: 'validation.default',
          notOneOf: 'validation.notOneOf',
        },
        string: {
          required: 'validation.required',
          url: 'validation.invalidUrl',
        },
      });

      return i18nextInstance;
    });
};

export default () => initializeI18next().then((i18nextInstance) => {
  const watchedState = onChange(state, render(elements, i18nextInstance));

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlsArray = watchedState.feeds.map((feed) => feed.url);

    validate(url, urlsArray)
      .then(() => {
        getDataFromUrl(url)
          .then((data) => {
            watchedState.feedback = 'validation.success';
            watchedState.status = 'valid';
            const { feeds, posts } = parseDataFromUrl(data, url);
            watchedState.feeds.push(...feeds);
            watchedState.posts.push(...posts);
          })
          .catch((error) => {
            switch (error.name) {
              case 'AxiosError':
                watchedState.feedback = 'validation.connectionError';
                break;
              default:
                watchedState.feedback = error.message;
            }
            watchedState.status = 'invalid';
          });
      })
      .catch((error) => {
        switch (error.name) {
          case 'AxiosError':
            watchedState.feedback = 'validation.connectionError';
            break;
          default:
            watchedState.feedback = error.message;
        }
        watchedState.status = 'invalid';
      });
  });
});
