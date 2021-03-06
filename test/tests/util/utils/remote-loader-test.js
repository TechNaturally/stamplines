describe('Utils.RemoteLoader', () => {
  describe('Constructor', () => {
    let RemoteLoader;
    before(() => {
      Test.assertSL();
      RemoteLoader = new Test.Lib.Utils.RemoteLoader(Test.SL);
    });
    after(() => {
      RemoteLoader = undefined;
    });
    it('should initialize', () => {
      expect(RemoteLoader).to.exist;
    });
    it('should be constructed by RemoteLoader', () => {
      expect(RemoteLoader.constructor.name).to.equal('RemoteLoader');
    });
  });

  describe('#load', () => {
    let path, path2, RemoteLoader;
    before(() => {
      path = 'assets/StampLines.json';
      path2 = 'assets/StampLines-2.json';
      RemoteLoader = new Test.Lib.Utils.RemoteLoader(Test.SL, {path: path});
    });
    after(() => {
      RemoteLoader = undefined;
    });
    it('should return a Promise', (done) => {
      let loaded = RemoteLoader.load(path);
      expect(loaded.constructor.name).to.equal('Promise');
      loaded.then((data) => {
        done();
      });
    });
    describe('with no path argument', () => {
      it(`should use its config.path and resolve with loaded data equalling Test.Files['${path}']`, () => {
        return new Promise((resolve, reject) => {
          let loaded = RemoteLoader.load();
          loaded
            .then((data) => {
              expect(data).to.eql(Test.Files[path]);
              resolve();
            })
            .catch(reject);
        });
      }).timeout(5000);
    });
    describe('with path argument', () => {
      it(`should resolve with loaded data equalling Test.Files['${path2}']`, () => {
        return new Promise((resolve, reject) => {
          let loaded = RemoteLoader.load(path2);
          loaded
            .then((data) => {
              expect(data).to.eql(Test.Files[path2]);
              resolve();
            })
            .catch(reject);
        });
      }).timeout(5000);
    });
    it('should call $.ajax once', (done) => {
      let spy = sinon.spy($, 'ajax');
      let loaded = RemoteLoader.load(path);
      expect($.ajax.calledOnce).to.be.true;
      $.ajax.restore();
      loaded.then((data) => {
        done();
      });
    });
  });
});
