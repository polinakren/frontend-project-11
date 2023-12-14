import axios from 'axios';

const getURLForRequest = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app/get');
  newUrl.searchParams.append('disableCache', 'true');
  newUrl.searchParams.append('url', url);
  return newUrl;
};

export default (url) => {
  const urlForRequest = getURLForRequest(url);
  return axios
    .get(urlForRequest)
    .then((response) => response.data.contents);
};
