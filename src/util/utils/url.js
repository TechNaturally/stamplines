var URL = {
  RX_HTTP: /https?:\/\/.+/,
  Window: {
    getBaseDomain: () => {
      return URL.Window.getProtocol()+window.location.hostname+((window.location.port || window.location.port===0)?`:${window.location.port}`:'');
    },
    getBasePath: () => {
      let url = window.location.pathname;
      if(window.location.pathname.slice(-1) != '/'){
        // doesn't end with /, treat as a file
        let pathSplit = url.split('/');
        url = pathSplit.slice(0, pathSplit.length-1).join('/')+'/';
      }
      return url;
    },
    getBasePathURL: () => {
      return URL.Window.getBaseDomain()+URL.Window.getBasePath();
    },
    getProtocol: () => {
      return window.location.protocol+'//';
    },
    getURL: () => {
      return window.location.href;
    }
  },
  isAbsolutePath: (uri) => {
    return !!(!uri || uri.charAt(0) == '/');
  },
  isRelativePath: (uri) => {
    return !!(!uri || (uri.charAt(0) != '/' && !URL.isURL(uri)));
  },
  isURL: (uri) => {
    return !!(uri && URL.RX_HTTP.test(uri));
  },
  toURL: (uri) => {
    if(URL.isAbsolutePath(uri)){
      return URL.Window.getBaseDomain()+uri;
    } else if(URL.isRelativePath(uri)){
      return URL.Window.getBasePathURL()+uri;
    } else if(URL.isURL(uri)){
      return uri;
    }
  }
};
export default URL;
