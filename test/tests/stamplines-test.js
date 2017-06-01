describe('StampLines', () => {
  let canvas, SL;
  before(() => {
    // make sure the default Test.SL already exists
    Test.assertSL();

    // initialize SL with dummy canvas and empty config
    canvas = $('<canvas></canvas>');
    SL = new Test.Lib.Core.StampLines(canvas);
  });
  after(() => {
    SL.destroy();
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(SL).to.exist;
    });
    it('should have config property', () => {
      expect(SL.config).to.exist;
    });
    it('should have Paper property constructed by PaperCanvas', () => {
      expect(SL.Paper.constructor.name).to.equal('PaperCanvas');
    });
    it('should have UI property constructed by UI', () => {
      expect(SL.UI.constructor.name).to.equal('UI');
    });
    it('should have Tools property constructed by ToolBelt', () => {
      expect(SL.Tools.constructor.name).to.equal('ToolBelt');
    });
    describe('Tools.Belt', () => {
      it('should exist', () => {
        expect(SL.Tools.Belt).to.exist;
      });
      it('should have core Select tool', () => {
        expect(SL.Tools.Belt.Select).to.exist;
      });
      it('should have core Move tool', () => {
        expect(SL.Tools.Belt.Move).to.exist;
      });
      it('should have core Scale tool', () => {
        expect(SL.Tools.Belt.Scale).to.exist;
      });
      it('should have core Rotate tool', () => {
        expect(SL.Tools.Belt.Rotate).to.exist;
      });
      it('should have CreateLine tool', () => {
        expect(SL.Tools.Belt.CreateLine).to.exist;
      });
      it('should have EditLine tool', () => {
        expect(SL.Tools.Belt.EditLine).to.exist;
      });
      it('should have CreateStamp tool', () => {
        expect(SL.Tools.Belt.CreateStamp).to.exist;
      });
    });
    it('should have Palettes property constructed by PaletteManager', () => {
      expect(SL.Palettes.constructor.name).to.equal('PaletteManager');
    });
    it('should have Panels property constructed by PanelManager', () => {
      expect(SL.Panels.constructor.name).to.equal('PanelManager');
    });
    it('should have Utils property constructed by Utils', () => {
      expect(SL.Utils.constructor.name).to.equal('Utils');
    });
  });

  describe('#loadConfig', () => {
    let remotePath;
    before(() => {
      remotePath = 'assets/StampLines.json';
    });
    it('should load a config file remotely', () => {
      return new Promise((resolve, reject) => {
        SL.loadConfig(remotePath)
          .then((config) => {
            expect(config).to.eql(Test.Files[remotePath]);
            resolve();
          })
          .catch(reject);
      });
    }).timeout(5000);
    it('should configure itself with the loaded config', () => {
      return new Promise((resolve, reject) => {
        SL.loadConfig(remotePath)
          .then((config) => {
            let remoteConfig = $.extend({}, StampLines.DEFAULT.config, config);
            expect(SL.config).to.eql(remoteConfig);
            resolve();
          })
          .catch(reject);
      });
    }).timeout(5000);
  });
});
