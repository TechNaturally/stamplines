describe('Core.PaperCanvas', () => {
  let canvas, SL, PaperCanvas;
  before(() => {
    Test.assertSL();
    canvas = $('<canvas></canvas>');
    SL = new Test.Lib.Core.StampLines(canvas);
    PaperCanvas = new Test.Lib.Core.PaperCanvas(SL, { canvas: canvas });
  });
  after(() => {
    PaperCanvas.destroy();
    PaperCanvas = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(PaperCanvas).to.exist;
    });
    it('should be constructed by PaperCanvas', () => {
      expect(PaperCanvas.constructor.name).to.equal('PaperCanvas');
    });
    it('should have a project', () => {
      expect(PaperCanvas.project).to.exist;
    });
    it('should not be the active paper project', () => {
      // Test.SL.Paper.project should still be active, because it was created before the local PaperCanvas
      expect(PaperCanvas.project).to.not.equal(paper.project);
    });
    it('should have a view', () => {
      expect(PaperCanvas.view).to.exist;
    });
  });

  describe('#canvas [DOM Element]', () => {
    it('should be set', () => {
      expect(PaperCanvas.canvas).to.exist;
    });
    it('should be a jQuery-wrapped canvas element', () => {
      expect(PaperCanvas.canvas).to.not.be.empty;
      expect(PaperCanvas.canvas[0].nodeName.toUpperCase()).to.eql('CANVAS');
    });
    it('should have class "sl-canvas"', () => {
      expect(PaperCanvas.canvas.hasClass('sl-canvas')).to.be.true;
    });
  });

  describe('#generatePaperItem', () => {
    afterEach(() => {
      PaperCanvas.configure();
    });
    it('should return an item constructed by the given constructor', () => {
      let testItem = PaperCanvas.generatePaperItem({}, paper.Path);
      expect(testItem.constructor).to.equal(paper.Path);
    });
    it('should return an item on this paperProject', () => {
      let testItem = PaperCanvas.generatePaperItem({}, paper.Path);
      expect(testItem.project).to.equal(PaperCanvas.project);
    });
    it('should assign data from the attributes object into the generated item\'s data object if it has one', () => {
      let testAttributes = {
        foo: 'bar',
        baz: 'biz',
        buz: 'fiz'
      };
      let testItem = PaperCanvas.generatePaperItem(testAttributes, paper.Path);
      expect(testItem.data).to.eql(testAttributes);
    });
    it('should assign a default Class if none is given', () => {
      let testItem = PaperCanvas.generatePaperItem({}, paper.Path);
      expect(testItem.data.Class).to.equal(PaperCanvas.defaultClass);
    });
    it('should assign a Layer if none is given and there is one defined for the item\'s Class', () => {
      let testItem = PaperCanvas.generatePaperItem({Class:'UI'}, paper.Path);
      expect(testItem.data.Layer).to.equal(PaperCanvas.Layers['UI']);
    });
    it('should resolve a string Layer to its numerical value as defined in Layers', () => {
      let testItem = PaperCanvas.generatePaperItem({Layer:'CONTENT'}, paper.Path);
      expect(testItem.data.Layer).to.equal(PaperCanvas.Layers['CONTENT']);
    });
    it('should track the item locally', () => {
      let spy = sinon.spy(PaperCanvas, 'trackItem');
      let testItem = PaperCanvas.generatePaperItem({Layer:'CONTENT'}, paper.Path);
      expect(spy.withArgs(testItem).callCount).to.equal(1);
      PaperCanvas.trackItem.restore();
    });
    it('should track the item in its source if one is set and has a trackPaperItem method', () => {
      testItemSource = {
        trackPaperItem: (item) => {}
      };
      let spy = sinon.spy(testItemSource, 'trackPaperItem');
      let testItem = PaperCanvas.generatePaperItem({Source: testItemSource}, paper.Path);
      expect(spy.withArgs(testItem).callCount).to.equal(1);
      testItemSource.trackPaperItem.restore();
    });
    it('should throw an error if an attributes object is not given as the first argument', () => {
      expect(() => {
        let testItem = PaperCanvas.generatePaperItem(undefined, paper.Path);
      }).to.throw('without attributes');
    });
    it('should throw an error if a function is not given as the second argument', () => {
      expect(() => {
        let testItem = PaperCanvas.generatePaperItem({}, null);
      }).to.throw('without constructor');
    });
    it('should throw an error if no Layer could be assigned', () => {
      expect(() => {
        let testItem = PaperCanvas.generatePaperItem({Class: 'Test'}, paper.Path);
      }).to.throw('without Layer attribute');
    });
    it('should throw an error if a valid numerical Layer could not be resolved', () => {
      expect(() => {
        let testItem = PaperCanvas.generatePaperItem({Layer: 'TEST'}, paper.Path);
      }).to.throw('with invalid Layer attribute');
    });
  });
  describe('#trackItem', () => {
    let testItem;
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
      PaperCanvas.untrackItem(testItem);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should track an item by Class', () => {
      PaperCanvas.trackItem(testItem);
      expect(PaperCanvas.paperItems[testItem.data.Class]).to.contain(testItem);
    });
    it('should track an item by Layer', () => {
      PaperCanvas.trackItem(testItem);
      expect(PaperCanvas.paperLayers[testItem.data.Layer].children).to.contain(testItem);
    });
    it('should throw an error if the item has no Class defined', () => {
      testItem.data.Class = undefined;
      delete testItem.data.Class;
      expect(() => {
        PaperCanvas.trackItem(testItem);
      }).to.throw('without Class attribute');
    });
    it('should throw an error if the item has no Layer defined', () => {
      testItem.data.Layer = undefined;
      delete testItem.data.Layer;
      expect(() => {
        PaperCanvas.trackItem(testItem);
      }).to.throw('without Layer attribute');
    });
    it('should throw an error if the item\'s Class is in the untrackable list', () => {
      let testItem1 = PaperCanvas.generatePaperItem({
        Class: 'Template'
      }, paper.Path);
      PaperCanvas.untrackItem(testItem1);
      expect(() => {
        PaperCanvas.trackItem(testItem1);
      }).to.throw('untrackable Class');
    });
  });
  describe('#trackItemByClass', () => {
    let testItem;
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
      PaperCanvas.untrackItem(testItem);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should track an item by Class', () => {
      PaperCanvas.trackItemByClass(testItem);
      expect(PaperCanvas.paperItems[testItem.data.Class]).to.contain(testItem);
    });
    it('should initialize the item\'s Class list if it doesn\'t already exist', () => {
      PaperCanvas.paperItems[testItem.data.Class] = undefined;
      PaperCanvas.trackItemByClass(testItem);
      expect(PaperCanvas.paperItems[testItem.data.Class]).to.exist;
    });
    it('should throw an error if the item has no Class defined', () => {
      testItem.data.Class = undefined;
      delete testItem.data.Class;
      expect(() => {
        PaperCanvas.trackItemByClass(testItem);
      }).to.throw('without Class attribute');
    });
    it('should throw an error if the item\'s Class is in the untrackable list', () => {
      let testItem1 = PaperCanvas.generatePaperItem({
        Class: 'Template'
      }, paper.Path);
      PaperCanvas.untrackItem(testItem1);
      expect(() => {
        PaperCanvas.trackItemByClass(testItem1);
      }).to.throw('untrackable Class');
    });
  });
  describe('#trackItemByLayer', () => {
    let testItem;
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
      PaperCanvas.untrackItem(testItem);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should track an item by Layer', () => {
      PaperCanvas.trackItemByLayer(testItem);
      expect(PaperCanvas.paperLayers[testItem.data.Layer].children).to.contain(testItem);
    });
    it('should initialize the paperLayer if it doesn\'t already exist', () => {
      PaperCanvas.paperLayers[testItem.data.Layer].remove();
      PaperCanvas.paperLayers[testItem.data.Layer] = undefined;
      PaperCanvas.trackItemByLayer(testItem);
      expect(PaperCanvas.paperLayers[testItem.data.Layer].children).to.exist;
    });
    it('should resolve a string Layer to its numerical value as defined in Layers', () => {
      let testItem1 = PaperCanvas.generatePaperItem({
        Layer: 'CONTENT'
      }, paper.Path);
      PaperCanvas.untrackItem(testItem1);
      PaperCanvas.trackItemByLayer(testItem1);
      expect(testItem1.data.Layer).to.equal(PaperCanvas.Layers['CONTENT']);
    });
    it('should throw an error if the item has no Layer defined', () => {
      let testItem1 = PaperCanvas.generatePaperItem({
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
      PaperCanvas.untrackItem(testItem1);
      testItem1.data.Layer = undefined;
      delete testItem1.data.Layer;
      expect(() => {
        PaperCanvas.trackItemByLayer(testItem1);
      }).to.throw('without Layer attribute');
    });
    it('should throw an error if the item has a Class is in the untrackable list', () => {
      let testItem1 = PaperCanvas.generatePaperItem({
        Class: 'Template'
      }, paper.Path);
      PaperCanvas.untrackItem(testItem1);
      expect(() => {
        PaperCanvas.trackItemByLayer(testItem1);
      }).to.throw('untrackable Class');
    });
  });
  describe('#destroyPaperItem', () => {
    let testItem;
    let testItemSource;
    before(() => {
      testItemSource = {
        untrackPaperItem: (item) => {}
      };
    });
    after(() => {
      testItemSource = undefined;
    });
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Source: testItemSource,
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should call the item\'s remove method if it has one', () => {
      let spy = sinon.spy(testItem, 'remove');
      PaperCanvas.destroyPaperItem(testItem);
      expect(spy.callCount).to.equal(1);
      testItem.remove.restore();
    });
    it('should untrack the item locally', () => {
      let spy = sinon.spy(PaperCanvas, 'untrackItem');
      spy.withArgs(testItem);
      PaperCanvas.destroyPaperItem(testItem);
      expect(spy.withArgs(testItem).callCount).to.equal(1);
      PaperCanvas.untrackItem.restore();
    });
    it('should track the item in its source if one is set and has an untrackPaperItem method', () => {
      let spy = sinon.spy(testItemSource, 'untrackPaperItem');
      spy.withArgs(testItem);
      PaperCanvas.destroyPaperItem(testItem);
      expect(spy.withArgs(testItem).callCount).to.equal(1);
      testItemSource.untrackPaperItem.restore();
    });
  });
  describe('#untrackItem', () => {
    let testItem;
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should untrack an item by Class', () => {
      PaperCanvas.untrackItem(testItem);
      expect(PaperCanvas.paperItems[testItem.data.Class]).to.not.contain(testItem);
    });
    it('should untrack an item by Layer', () => {
      PaperCanvas.untrackItem(testItem);
      expect(PaperCanvas.paperLayers[testItem.data.Layer].children).to.not.contain(testItem);
    });
  });
  describe('#untrackItemByClass', () => {
    let testItem;
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should untrack an item by Class', () => {
      PaperCanvas.untrackItemByClass(testItem);
      expect(PaperCanvas.paperItems[testItem.data.Class]).to.not.contain(testItem);
    });
  });
  describe('#untrackItemByLayer', () => {
    let testItem;
    beforeEach(() => {
      testItem = PaperCanvas.generatePaperItem({
        Class: 'Content',
        Layer: PaperCanvas.Layers.CONTENT
      }, paper.Path);
    });
    afterEach(() => {
      PaperCanvas.configure();
      testItem = undefined;
    });
    it('should untrack an item by Layer', () => {
      PaperCanvas.untrackItemByLayer(testItem);
      expect(PaperCanvas.paperLayers[testItem.data.Layer].children).to.not.contain(testItem);
    });
  });
  describe('#sortLayers', () => {
    after(() => {
      PaperCanvas.configure();
    });
    it('should call bringToFront() on each paperLayer, ordered by key', () => {
      let activeProject = paper.project;
      if (PaperCanvas.project && activeProject != PaperCanvas.project) {
        PaperCanvas.project.activate();
      }
      let testLayers = {
        50: new paper.Layer(),
        500: new paper.Layer(),
        10: new paper.Layer(),
        400: new paper.Layer(),
        750: new paper.Layer(),
        42: new paper.Layer(),
        375: new paper.Layer(),
        36: new paper.Layer(),
        100: new paper.Layer()
      };
      if (activeProject && activeProject != PaperCanvas.project) {
        // swap back after all relevant paper objects are initialized
        activeProject.activate();
      }

      // inject the testLayers
      for (let layer in testLayers) {
        PaperCanvas.paperLayers[layer] = testLayers[layer];
      }

      // create the spies in order
      let layerOrder = Object.keys(testLayers);
      layerOrder.sort((a, b) => {
        return (Number(a) - Number(b));
      });
      let spies = [];
      let spied = [];
      layerOrder.forEach((layer) => {
        let spy = sinon.spy(testLayers[layer], 'bringToFront');
        spied.push(testLayers[layer].bringToFront);
        spies.push(spy);
      });

      // run the sort
      PaperCanvas.sortLayers();

      // calling with .apply allows us to pass array of spies
      sinon.assert.callOrder.apply(sinon.assert, spies);

      // restore the spied on functions
      spied.forEach((spied) => {
        spied.restore();
      });
    });
  });
});
