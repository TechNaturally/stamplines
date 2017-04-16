describe('Utils.URL', () => {
  let baseDomain = 'http://localhost:8000';
  let basePath = '/test/';
  let baseURL = `${baseDomain}${basePath}`;
  let relativePath = 'sub-path';
  let absolutePath = `${basePath}${relativePath}`;
  let URL = `${baseDomain}${absolutePath}`;

  describe('#Window.getBaseDomain', () => {
    it('should return the protocol and domain name portion of the current URL', () => {
      expect(Test.Lib.Utils.URL.Window.getBaseDomain()).to.equal(baseDomain);
    });
  });
  describe('#Window.getBasePath', () => {
    it('should return the path portion of the current URL', () => {
      expect(Test.Lib.Utils.URL.Window.getBasePath()).to.equal(basePath);
    });
  });
  describe('#Window.getBasePathURL', () => {
    it('should return the protocol, domain, and path portion of the current URL', () => {
      expect(Test.Lib.Utils.URL.Window.getBasePathURL()).to.equal(baseURL);
    });
  });
  describe('#isAbsolutePath', () => {
    it('should return true if given an absolute path', () => {
      expect(Test.Lib.Utils.URL.isAbsolutePath(absolutePath)).to.be.true;
    });
    it('should return false if given a relative path', () => {
      expect(Test.Lib.Utils.URL.isAbsolutePath(relativePath)).to.be.false;
    });
    it('should return false if given a URL', () => {
      expect(Test.Lib.Utils.URL.isAbsolutePath(URL)).to.be.false;
    });
  });
  describe('#isRelativePath', () => {
    it('should return true if given a relative path', () => {
      expect(Test.Lib.Utils.URL.isRelativePath(relativePath)).to.be.true;
    });
    it('should return false if given an absolute path', () => {
      expect(Test.Lib.Utils.URL.isRelativePath(absolutePath)).to.be.false;
    });
    it('should return false if given a URL', () => {
      expect(Test.Lib.Utils.URL.isRelativePath(URL)).to.be.false;
    });
  });
  describe('#isURL', () => {
    it('should return true if given a URL', () => {
      expect(Test.Lib.Utils.URL.isURL(URL)).to.be.true;
    });
    it('should return false if given an absolute path', () => {
      expect(Test.Lib.Utils.URL.isURL(absolutePath)).to.be.false;
    });
    it('should return false if given a relative path', () => {
      expect(Test.Lib.Utils.URL.isURL(relativePath)).to.be.false;
    });
  });
  describe('#toURL', () => {
    it('should return a URL given an absolute path', () => {
      expect(Test.Lib.Utils.URL.toURL(absolutePath)).to.equal(URL);
    });
    it('should return a URL given a relative path', () => {
      expect(Test.Lib.Utils.URL.toURL(relativePath)).to.equal(URL);
    });
    it('should return its input given a URL', () => {
      expect(Test.Lib.Utils.URL.toURL(URL)).to.equal(URL);
    });
  });
});
