export default (data, url) => {
  const parseXml = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      const error = new Error();
      error.name = parseError.textContent;
      error.message = 'validation.invalidRss';
      throw error;
    }
    return xmlDoc;
  };

  const extractContent = (selector, element) => element.querySelector(selector).textContent;

  const extractPostInfo = (item) => ({
    postTitle: extractContent('title', item),
    postLink: extractContent('link', item),
    postDescription: extractContent('description', item),
  });

  const xmlDocument = parseXml(data);

  const feedTitle = xmlDocument.querySelector('title').textContent;
  const feedDescription = xmlDocument.querySelector('description').textContent;

  const postItems = xmlDocument.querySelectorAll('item');
  const posts = Array.from(postItems).map(extractPostInfo);

  const feed = { feedTitle, feedDescription, url };

  return { feed, posts };
};
