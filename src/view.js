export default (elements) => (path, value) => {
  const updatedElements = { ...elements };
  if (path === 'errors' && value) {
    updatedElements.inputEl.classList.add('is-invalid');
    updatedElements.feedbackEl.textContent = value;
  } else if (path === 'status' && value === 'valid') {
    updatedElements.inputEl.classList.remove('is-invalid');
    updatedElements.inputEl.focus();
    updatedElements.formEl.reset();
    updatedElements.feedbackEl.textContent = '';
  }
};
