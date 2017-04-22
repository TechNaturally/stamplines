describe('UI.CursorManager', () => {
  let TestCursor = {
    default: 'crosshair',
    standard: 'pointer',
    custom: 'crosshairs',
    img: {
      'src': '/test/assets/stamps/rectangle-rounded.svg'
    },
    icon: {
      'icon': 'plus'
    }
  };

  let CursorManager;
  before(() => {
    Test.assertSL();
    CursorManager = new Test.Lib.UI.CursorManager(Test.SL, Test.Lib.Core.StampLines.DEFAULT.config.UI.Mouse.Cursors);
  });
  after(() => {
    CursorManager.destroy();
    CursorManager = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(CursorManager).to.exist;
    });
    it('should be constructed by CursorManager', () => {
      expect(CursorManager.constructor.name).to.equal('CursorManager');
    });
  });

  describe('#activateCursor', () => {
    afterEach(() => {
      CursorManager.deactivateCursor();
    });
    describe('- when called with no parameters', () => {
      it(`should set the activeCursor to "${TestCursor.default}"`, () => {
        CursorManager.activateCursor();
        expect(CursorManager.activeCursor).to.equal(TestCursor.default);
      });
      it(`should set css('cursor', '${TestCursor.default}') on the canvas element`, () => {
        CursorManager.activateCursor();
        expect(Test.Canvas.css('cursor')).to.equal(TestCursor.default);
      });
    });
    describe(`- when called with "${TestCursor.standard}"`, () => {
      it(`should set the activeCursor to "${TestCursor.standard}"`, () => {
        CursorManager.activateCursor(TestCursor.standard);
        expect(CursorManager.activeCursor).to.equal(TestCursor.standard);
      });
      it(`should set css('cursor', '${TestCursor.standard}') on the canvas element`, () => {
        CursorManager.activateCursor(TestCursor.standard);
        expect(Test.Canvas.css('cursor')).to.equal(TestCursor.standard);
      });
    });
    describe(`- when called with "${TestCursor.custom}"`, () => {
      it(`should set the activeCursor to "icon-${TestCursor.custom}"`, () => {
        CursorManager.activateCursor(TestCursor.custom);
        expect(CursorManager.activeCursor).to.equal(`icon-${TestCursor.custom}`);
      });
    });
    describe('- when called with object with \'src\' property', () => {
      it(`should set the activeCursor to "img-${TestCursor.img.src}"`, () => {
        CursorManager.activateCursor(TestCursor.img);
        expect(CursorManager.activeCursor).to.equal(`img-${TestCursor.img.src}`);
      });
      it('should create an SL.UI.DOM.cursor DOM node', () => {
        CursorManager.activateCursor(TestCursor.img);
        expect(Test.SL.UI.DOM.cursor).to.exist;
      });
      it('should create an SL.UI.DOM.cursor DOM node of type img', () => {
        CursorManager.activateCursor(TestCursor.img);
        expect(Test.SL.UI.DOM.cursor[0].nodeName.toUpperCase()).to.equal('IMG');
      });
      it('should create an SL.UI.DOM.cursor DOM node of type img with class ".sl-cursor"', () => {
        CursorManager.activateCursor(TestCursor.img);
        expect(Test.SL.UI.DOM.cursor.is('.sl-cursor')).to.be.true;
      });
      it('should create an SL.UI.DOM.cursor DOM node of type img with src attribute equal to the src property', () => {
        CursorManager.activateCursor(TestCursor.img);
        expect(Test.SL.UI.DOM.cursor.attr('src')).to.equal(TestCursor.img.src);
      });
      it('should add the SL.UI.DOM.cursor DOM node to the DOM', () => {
        CursorManager.activateCursor(TestCursor.img);
        let cursorDOM = $('.sl-cursor');
        expect(cursorDOM[0]).to.equal(Test.SL.UI.DOM.cursor[0]);
      });
    });
    describe('- when called with object with \'icon\' property', () => {
      it(`should set the activeCursor to "icon-${TestCursor.icon.icon}"`, () => {
        CursorManager.activateCursor(TestCursor.icon);
        expect(CursorManager.activeCursor).to.equal(`icon-${TestCursor.icon.icon}`);
      });
      it('should create an SL.UI.DOM.cursor DOM node', () => {
        CursorManager.activateCursor(TestCursor.icon);
        expect(Test.SL.UI.DOM.cursor).to.exist;
      });
      it('should create an SL.UI.DOM.cursor DOM node of type div', () => {
        CursorManager.activateCursor(TestCursor.icon);
        expect(Test.SL.UI.DOM.cursor[0].nodeName.toUpperCase()).to.equal('DIV');
      });
      it('should create an SL.UI.DOM.cursor DOM node of type div with class ".sl-cursor.icon.icon-${TestCursor.icon.icon}"', () => {
        CursorManager.activateCursor(TestCursor.icon);
        expect(Test.SL.UI.DOM.cursor.is(`.sl-cursor.icon.icon-${TestCursor.icon.icon}`)).to.be.true;
      });
      it('should add the SL.UI.DOM.cursor DOM node to the DOM', () => {
        CursorManager.activateCursor(TestCursor.icon);
        let cursorDOM = $('.sl-cursor');
        expect(cursorDOM[0]).to.equal(Test.SL.UI.DOM.cursor[0]);
      });
    });
  });
  describe('#deactivateCursor', () => {
    it(`should set the activeCursor to "${TestCursor.default}"`, () => {
      CursorManager.activateCursor(TestCursor.standard);
      CursorManager.deactivateCursor();
      expect(CursorManager.activeCursor).to.equal(TestCursor.default);
    });
    it(`should set css('cursor', '${TestCursor.default}') on the canvas element`, () => {
      CursorManager.activateCursor(TestCursor.standard);
      CursorManager.deactivateCursor();
      expect(Test.Canvas.css('cursor')).to.equal(TestCursor.default);
    });
    it('should remove the Test.SL.UI.DOM.cursor DOM node', () => {
      CursorManager.activateCursor(TestCursor.img);
      CursorManager.deactivateCursor();
      expect(Test.SL.UI.DOM.cursor).to.not.exist;
    });
    it('should remove the .sl-cursor DOM node', () => {
      let cursorDOM = $('.sl-cursor');
      expect(cursorDOM).to.have.lengthOf(0);
    });
  });

  describe('#loadCustomCursors', () => {
    let testCursors = {
      'foo': 'bar',
      'baz': 'biz'
    };
    afterEach(() => {
      for (let name in testCursors) {
        if (CursorManager.customCursors[name]) {
          CursorManager.customCursors[name] = undefined;
          delete CursorManager.customCursors[name];
        }
      }
    });
    it('should load a list of cursors into the CursorManager.customCursors table', () => {
      CursorManager.loadCustomCursors(testCursors);
      expect(CursorManager.customCursors).to.contain.all.keys(testCursors);
    });
  });
  describe('#addCustomCursor', () => {
    let testCursorName = 'foo';
    let testCursorDefinition = 'bar';
    afterEach(() => {
      if (CursorManager.customCursors[testCursorName]) {
        CursorManager.customCursors[testCursorName] = undefined;
        delete CursorManager.customCursors[testCursorName];
      }
    });
    it('should a a cursor to the CursorManager.customCursors table', () => {
      CursorManager.addCustomCursor(testCursorName, testCursorDefinition);
      expect(CursorManager.customCursors[testCursorName]).to.exist;
    });
  });
});
