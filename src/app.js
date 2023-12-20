import 'bootstrap';
import { setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import _ from 'lodash';

import './style.scss';
import view from './view.js';
import resources from './locales/index.js';
import getDataFromUrl from './getDataFromUrl.js';
import parseDataFromUrl from './parseDataFromUrl.js';
import validate from './validator.js';

const DEFAULT_LANGUAGE = 'ru';
const DELAY = 5000;

const elements = {
  formElement: document.querySelector('.rss-form'),
  inputElement: document.querySelector('#url-input'),
  feedbackElement: document.querySelector('.feedback'),
  feedsElement: document.querySelector('.feeds'),
  postsElement: document.querySelector('.posts'),
  modalElement: document.getElementById('modal'),
};

const state = {
  status: '',
  feedback: '',
  feeds: [],
  posts: [],
  modalPostId: null,
  viewedPostIds: [],
};

const setYupLocale = () => {
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
      setYupLocale();

      return i18nextInstance;
    });
};

const setFeedId = (feed, feedId) => {
  const updatedFeed = { ...feed };
  updatedFeed.feedId = feedId;
  return updatedFeed;
};

const setPostsIds = (posts, feedId) => posts.map((post) => ({
  ...post,
  feedId,
  postId: _.uniqueId(),
}));

const handleErrors = (error) => (error.name === 'AxiosError'
  ? 'validation.connectionError'
  : error.message);

const checkForNewPosts = (watchedState) => {
  const updatedState = { ...watchedState };
  const promises = updatedState.feeds.map((feed) => getDataFromUrl(feed.url)
    .then((data) => {
      const { posts: currentPosts } = parseDataFromUrl(data, feed.url);
      const newPosts = currentPosts.filter((post) => !updatedState.posts.some(
        (existingPost) => existingPost.postLink === post.postLink,
      ));
      if (newPosts.length > 0) {
        const newPostsWithIds = setPostsIds(newPosts, feed.feedId);
        updatedState.posts.push(...newPostsWithIds);
      }
    })
    .catch((error) => {
      updatedState.status = 'invalid';
      updatedState.feedback = handleErrors(error);
    }));
  Promise.all(promises).then(() => setTimeout(() => checkForNewPosts(updatedState), DELAY));
};

export default () => initializeI18next().then((i18nextInstance) => {
  const watchedState = onChange(state, view(elements, i18nextInstance, state));

  checkForNewPosts(watchedState);

  elements.formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlsArray = watchedState.feeds.map((feed) => feed.url);

    validate(url, urlsArray)
      .then(() => {
        watchedState.status = 'valid';
        getDataFromUrl(url)
          .then((data) => {
            watchedState.feedback = 'validation.success';
            watchedState.status = 'uploaded';

            const { feed, posts } = parseDataFromUrl(data, url);
            const feedId = _.uniqueId();
            const feedWithId = setFeedId(feed, feedId);
            const postsWithIds = setPostsIds(posts, feedId);

            watchedState.feeds.push(feedWithId);
            watchedState.posts.push(...postsWithIds);
          })
          .catch((error) => {
            watchedState.status = 'invalid';
            watchedState.feedback = handleErrors(error);
          });
      })
      .catch((error) => {
        watchedState.status = 'invalid';
        watchedState.feedback = handleErrors(error);
      });
  });

  elements.modalElement.addEventListener('show.bs.modal', (e) => {
    const postId = e.relatedTarget.dataset.id;
    watchedState.modalPostId = postId;
    watchedState.viewedPostIds.push(postId);
  });
});
