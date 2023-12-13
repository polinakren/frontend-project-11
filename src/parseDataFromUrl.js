export default (data, url) => {
  const parseXml = (xmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('validation.invalidRss');
    }
    return doc;
  };

  const extractContent = (selector, element) => element.querySelector(selector).textContent;

  const extractFeedInfo = (doc) => {
    const feedTitle = extractContent('title', doc);
    const feedDescription = extractContent('description', doc);
    return { feedTitle, feedDescription };
  };

  const extractPostInfo = (item) => ({
    postTitle: extractContent('title', item),
    postLink: extractContent('link', item),
    postDescription: extractContent('description', item),
  });

  const doc = parseXml(data);
  const feeds = [{ url, ...extractFeedInfo(doc) }];
  const posts = Array.from(doc.querySelectorAll('item')).map(extractPostInfo);

  return { feeds, posts };
};
