/* eslint-disable no-unused-vars */
import DOMPurify from 'dompurify';

// @link: https://github.com/w3c/trusted-types/blob/main/explainer.md
// @link: https://web.dev/articles/trusted-types#default-policy
// @link: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API#injection_sinks

// @ts-ignore
const sanitizeHtml = (string: string, type: any, sink: any) => {
  return DOMPurify.sanitize(string, { RETURN_TRUSTED_TYPE: true });
};

// @ts-ignore
const sanitizeUrl = (url: string, type, sink) => {
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
    // @ts-ignore
    createHTML: (string, type, sink) => sanitizeHtml(string, type, sink),
    createScriptURL: (url, type, sink) => sanitizeUrl(url, type, sink),
  });
}
