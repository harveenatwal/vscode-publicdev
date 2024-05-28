export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

interface ReplaceWebviewHtmlTokensOptions {
  cspSource: string;
  cspNonce: string;
  cssUri: string;
  codiconsUri: string;
  pdiconsUri: string;
  rootUri: string;
}

export function replaceWebviewHtmlTokens(
  html: string,
  options: ReplaceWebviewHtmlTokensOptions
) {
  const { cspNonce, cspSource, cssUri, codiconsUri, pdiconsUri, rootUri } =
    options;

  return html.replace(
    /#{(cssUri|cspSource|cspNonce|codiconsUri|pdiconsUri|rootUri)}/g,
    (_substring: string, token: string) => {
      switch (token) {
        case "cspSource":
          return cspSource;
        case "cspNonce":
          return cspNonce;
        case "cssUri":
          return cssUri;
        case "codiconsUri":
          return codiconsUri;
        case "pdiconsUri":
          return pdiconsUri;
        case "rootUri":
          return rootUri;
        default:
          return "";
      }
    }
  );
}
