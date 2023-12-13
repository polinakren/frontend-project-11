const createCardElement = (elementType, classes = []) => {
  const element = document.createElement(elementType);
  element.classList.add(...classes);
  return element;
};

const createFeedListItem = (feed) => {
  const feedLiEl = createCardElement('li', ['list-group-item', 'border-0', 'border-end-0']);

  const feedTitleEl = createCardElement('h3', ['h6', 'm-0']);
  feedTitleEl.textContent = feed.feedTitle;

  const feedDescriptionEl = createCardElement('p', ['m-0', 'small', 'text-black-50']);
  feedDescriptionEl.textContent = feed.feedDescription;

  feedLiEl.append(feedTitleEl, feedDescriptionEl);
  return feedLiEl;
};

const createPostListItem = (post) => {
  const postLiEl = createCardElement('li', [
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  ]);

  const postAEl = createCardElement('a', ['fw-bold']);
  postAEl.href = post.postLink;
  postAEl.textContent = post.postTitle;
  postAEl.dataset.id = post.id;
  postAEl.target = '_blank';
  postAEl.rel = 'noopener noreferrer';

  postLiEl.append(postAEl);
  return postLiEl;
};

const updateStatus = (elements, value) => {
  if (value === 'valid') {
    elements.inputEl.classList.remove('is-invalid');
    elements.feedbackEl.classList.remove('text-danger');
    elements.feedbackEl.classList.add('text-success');
    elements.formEl.reset();
    elements.inputEl.focus();
  } else if (value === 'invalid') {
    elements.inputEl.classList.add('is-invalid');
    elements.feedbackEl.classList.remove('text-success');
    elements.feedbackEl.classList.add('text-danger');
  }
};

const updateFeedback = (elements, i18n, value) => {
  const updatedElements = { ...elements };
  updatedElements.feedbackEl.textContent = i18n.t(value);
};

const createCardElements = (container, i18n, title) => {
  const containerElement = container;

  containerElement.innerHTML = '';

  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'border-0');
  containerElement.appendChild(cardEl);

  const cardBodyEl = document.createElement('div');
  cardBodyEl.classList.add('card-body');
  cardEl.appendChild(cardBodyEl);

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(title);
  cardBodyEl.appendChild(cardTitle);

  const ulEl = document.createElement('ul');
  cardEl.appendChild(ulEl);
  return ulEl;
};

const updateFeeds = (elements, i18n, feeds) => {
  const feedUlEl = createCardElements(elements.feedsEl, i18n, 'rss.feeds');
  feeds.forEach((feed) => {
    const feedLiEl = createFeedListItem(feed);
    feedUlEl.append(feedLiEl);
  });
};

const updatePosts = (elements, i18n, posts) => {
  const postUlEl = createCardElements(elements.postsEl, i18n, 'rss.posts');
  posts.forEach((post) => {
    const postLiEl = createPostListItem(post);
    postUlEl.append(postLiEl);
  });
};

export default (elements, i18n) => (path, value) => {
  switch (path) {
    case 'status':
      updateStatus(elements, value);
      break;

    case 'feedback':
      updateFeedback(elements, i18n, value);
      break;

    case 'feeds':
      updateFeeds(elements, i18n, value);
      break;

    case 'posts':
      updatePosts(elements, i18n, value);
      break;

    default:
      throw new Error('Unknown path!');
  }
};
