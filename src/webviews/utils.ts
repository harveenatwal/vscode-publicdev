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
}

export function replaceWebviewHtmlTokens(
  html: string,
  options: ReplaceWebviewHtmlTokensOptions
) {
  const { cspNonce, cspSource, cssUri } = options;

  return html.replace(
    /#{(cssUri|cspSource|cspNonce|)}/g,
    (_substring: string, token: string) => {
      switch (token) {
        case "cspSource":
          return cspSource;
        case "cspNonce":
          return cspNonce;
        case "cssUri":
          return cssUri;
        default:
          return "";
      }
    }
  );
}
