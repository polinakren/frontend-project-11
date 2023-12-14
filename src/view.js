const createElement = (tag, classes = []) => {
  const createdElement = document.createElement(tag);
  createdElement.classList.add(...classes);
  return createdElement;
};

const addAttributes = (el, attributes) => {
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
};

const createCardElements = (container, i18nextInstance, title) => {
  const cardContainer = document.createElement('div');
  cardContainer.innerHTML = '';

  const cardElement = createElement('div', ['card', 'border-0']);
  cardContainer.appendChild(cardElement);

  const cardBodyElement = createElement('div', ['card-body']);
  cardElement.appendChild(cardBodyElement);

  const cardTitleElement = createElement('h2', ['card-title', 'h4']);
  cardTitleElement.textContent = i18nextInstance.t(title);
  cardBodyElement.appendChild(cardTitleElement);

  const ulEl = createElement('ul', ['list-group', 'border-0', 'rounded-0']);
  cardElement.appendChild(ulEl);

  container.appendChild(cardContainer);

  return ulEl;
};

const createButton = (id, i18n) => {
  const buttonElement = createElement('button', ['btn', 'btn-outline-primary', 'btn-sm']);
  addAttributes(buttonElement, {
    type: 'button',
    'data-id': id,
    'data-bs-toggle': 'modal',
    'data-bs-target': '#modal',
  });
  buttonElement.textContent = i18n.t('rss.button');
  return buttonElement;
};

const renderInputAndFeedbackStyle = (value, elements) => {
  const { inputElement, feedbackElement, formElement } = elements;

  switch (value) {
    case 'uploaded':
      inputElement.classList.remove('is-invalid');
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      formElement.reset();
      inputElement.focus();
      break;

    case 'valid':
      feedbackElement.textContent = '';
      break;

    case 'invalid':
      inputElement.classList.add('is-invalid');
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      break;

    default:
      throw new Error('Unknown value!');
  }
};

const renderListItems = (container, items, renderer) => {
  items.forEach((el) => {
    const listItem = createElement('li', ['list-group-item', 'border-0', 'border-end-0']);
    renderer(listItem, el);
    container.appendChild(listItem);
  });
};

const renderFeeds = (value, elements, i18nextInstance, cardTitle) => {
  const feedUlElement = createCardElements(elements.feedsElement, i18nextInstance, cardTitle);

  renderListItems(feedUlElement, value, (item, el) => {
    const feedTitleElement = createElement('h3', ['h6', 'm-0']);
    feedTitleElement.textContent = el.feedTitle;
    item.appendChild(feedTitleElement);

    const feedDescriptionElement = createElement('p', ['m-0', 'small', 'text-black-50']);
    feedDescriptionElement.textContent = el.feedDescription;
    item.appendChild(feedDescriptionElement);
  });
};

const renderNewPosts = (value, elements, i18n, cardTitle) => {
  const postUlElement = createCardElements(
    elements.postsElement,
    i18n,
    cardTitle,
  );

  value.forEach((element) => {
    const postLiElement = document.createElement('li');
    postLiElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const postAElement = document.createElement('a');
    postAElement.href = element.postLink;
    postAElement.textContent = element.postTitle;
    postAElement.classList.add('fw-bold');
    postAElement.dataset.id = element.postId;
    postAElement.target = '_blank';
    postAElement.rel = 'noopener noreferrer';
    postLiElement.append(postAElement);

    const buttonElement = createButton(element.postId, i18n);

    postLiElement.append(buttonElement);
    postUlElement.append(postLiElement);
  });
};

const renderViewedPosts = (postsIds) => postsIds.forEach((postId) => {
  const viewedPost = document.querySelector(`[data-id='${postId}']`);
  viewedPost.classList.remove('fw-bold');
  viewedPost.classList.add('fw-normal');
  viewedPost.classList.add('text-secondary');
});

const renderModalWindow = (value, elements, state) => {
  const { modalElement } = elements;
  const modalHeader = modalElement.querySelector('.modal-header');
  const modalBody = modalElement.querySelector('.modal-body');

  const postDataToShow = state.posts.find((post) => post.postId === value);
  const { postTitle, postDescription, postLink } = postDataToShow;

  modalHeader.textContent = postTitle;
  modalBody.textContent = postDescription;

  const viewArticleBtn = modalElement.querySelector('.btn-primary');
  addAttributes(viewArticleBtn, { href: postLink });
};

const renderFeedback = (value, elements, i18nextInstance) => {
  const el = { ...elements };
  el.feedbackElement.textContent = i18nextInstance.t(value);
};

export default (elements, i18nextInstance, state) => (path, value) => {
  const cardTitle = `rss.${path}`;
  switch (path) {
    case 'status':
      renderInputAndFeedbackStyle(value, elements);
      break;

    case 'feedback': {
      renderFeedback(value, elements, i18nextInstance);
      break;
    }

    case 'feeds': {
      renderFeeds(value, elements, i18nextInstance, cardTitle);
      break;
    }

    case 'posts':
      renderNewPosts(value, elements, i18nextInstance, cardTitle);
      renderViewedPosts(state.viewedPostIds);
      break;

    case 'modalPostId':
      renderModalWindow(value, elements, state);
      break;

    case 'viewedPostIds':
      renderViewedPosts(value);
      break;

    default:
      throw new Error('Unknown path!');
  }
};
