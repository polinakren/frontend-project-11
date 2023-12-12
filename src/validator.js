import * as yup from 'yup';

const validate = (url, urlsList) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(urlsList);

  return schema.validate(url);
};
export default validate;
