import * as yup from 'yup';

const validate = (url, urlsList) => {
  const schema = yup
    .string()
    .required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(urlsList, 'RSS уже существует');

  return schema.validate(url);
};
export default validate;
