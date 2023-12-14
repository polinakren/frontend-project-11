import * as yup from 'yup';

export default (url, urlsList) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(urlsList);

  return schema.validate(url);
};
