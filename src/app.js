import 'bootstrap';
import onChange from 'on-change';
import i18next from 'i18next';
import { setLocale } from 'yup';
import _ from 'lodash';

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

const getFeedsWithIds = (feeds, feedId) => feeds.map((feed) => ({ ...feed, feedId }));

const getPostsWithIds = (posts, feedId) => posts.map((post) => (
  { ...post, feedId, postid: _.uniqueId() }
));

export default () => initializeI18next().then((i18nextInstance) => {
  const watchedState = onChange(state, render(elements, i18nextInstance));

  const checkForNewPosts = () => {
    watchedState.feeds.forEach((feed) => {
      getDataFromUrl(feed.url)
        .then((data) => {
          const { posts: newPosts } = parseDataFromUrl(data, feed.url);
          const filteredNewPosts = newPosts.filter((post) => !watchedState.posts.some(
            (existingPost) => existingPost.postLink === post.postLink,
          ));
          if (filteredNewPosts.length > 0) {
            const newPostsWithIds = getPostsWithIds(
              filteredNewPosts,
              feed.feedId,
            );
            watchedState.posts.push(...newPostsWithIds);
            render(elements, i18nextInstance);
          }
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
    setTimeout(checkForNewPosts, 5000);
  };

  checkForNewPosts();

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
            const feedId = _.uniqueId();
            const feedsWithIds = getFeedsWithIds(feeds, feedId);
            const postsWithIds = getPostsWithIds(posts, feedId);

            watchedState.feeds.push(...feedsWithIds);
            watchedState.posts.push(...postsWithIds);
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
