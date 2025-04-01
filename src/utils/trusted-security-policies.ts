import DOMPurify from 'dompurify';

/*
 @link: https://github.com/w3c/trusted-types/blob/main/explainer.md
 @link: https://web.dev/articles/trusted-types#default-policy
 @link: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API#injection_sinks
*/
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html);
};

const sanitizeUrl = (url: string) => {
  const { hostname, href } = new URL(url, document.baseURI);

  if (hostname === location.hostname || hostname === 'localhost') {
    return href;
  }
  throw new TypeError(
    `${url} is not trusted. for more detail: https://web.dev/articles/trusted-types#default-policy`,
  );
};

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (html: string) => sanitizeHtml(html),
    createScriptURL: (url: string) => sanitizeUrl(url),
  });
}
