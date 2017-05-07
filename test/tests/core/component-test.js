describe('Core.Component', () => {
  describe('Constructor', () => {
    it('should have type "Component"', () => {
      let component = new Test.Lib.Core.Component(Test.SL, {});
      expect(component.type).to.equal('Component');
    });
    it('should throw an error if no StampLines object provided', () => {
      expect(() => {
        let component = new Test.Lib.Core.Component();
      }).to.throw('without an SL');
    });
  });
  describe('#trackPaperItem', () => {
    let component;
    let testItem;
    before(() => {
      component = new Test.Lib.Core.Component(Test.SL, {});
      testItem = {foo: 'bar'};
    });
    after(() => {
      component = undefined;
    });
    afterEach(() => {
      component.reset();
    });
    it('should track an item in the PaperItems list', () => {
      component.trackPaperItem(testItem);
      expect(component.PaperItems).to.include(testItem);
    });
    it('should initialize PaperItems as an array if it does not exist', () => {
      component.PaperItems = undefined;
      component.trackPaperItem(testItem);
      expect(component.PaperItems.constructor).to.equal(Array);
    });
    it('should not add the item more than once if it already exists', () => {
      component.trackPaperItem(testItem);
      component.trackPaperItem(testItem);
      let itemCount = component.PaperItems.reduce((count, item) => {
        return count + (item === testItem);
      }, 0);
      expect(itemCount).to.equal(1);
    });
  });
  describe('#untrackPaperItem', () => {
    let component;
    let testItem;
    before(() => {
      component = new Test.Lib.Core.Component(Test.SL, {});
      testItem = {foo: 'bar'};
    });
    after(() => {
      component = undefined;
    });
    afterEach(() => {
      component.reset();
    });
    it('should remove an item from the PaperItems list', () => {
      component.trackPaperItem(testItem);
      component.untrackPaperItem(testItem);
      expect(component.PaperItems).to.not.include(testItem);
    });
    it('should do nothing if there is no PaperItems list', () => {
      expect(() => {
        component.PaperItems = undefined;
        component.untrackPaperItem(testItem);
      }).not.to.throw(/.*/);
    });
    it('should do nothing if the item is not in the PaperItems list', () => {
      expect(() => {
        component.PaperItems = [];
        component.untrackPaperItem(testItem);
      }).not.to.throw(/.*/);
    });
  });
  describe('#destroyPaperItems', () => {
    let component;
    let testItems;
    before(() => {
      component = new Test.Lib.Core.Component(Test.SL, {});
      testItems = [
        {foo: 'bar'},
        {baz: 'biz'},
        {buz: 'fiz'}
      ];
    });
    after(() => {
      component = undefined;
    });
    afterEach(() => {
      component.reset();
    });
    it('should call SL.Paper.destroyPaperItem for each item in the PaperItems list', () => {
      let spy = sinon.spy(component.SL.Paper, 'destroyPaperItem');
      testItems.forEach((testItem) => {
        component.trackPaperItem(testItem);
        spy.withArgs(testItem);
      });
      component.destroyPaperItems();
      testItems.forEach((testItem) => {
        expect(spy.withArgs(testItem).callCount).to.equal(1);
      });
      component.SL.Paper.destroyPaperItem.restore();
    });
    it('should empty the PaperItems list', () => {
      testItems.forEach((testItem) => {
        component.trackPaperItem(testItem);
        component.destroyPaperItems();
        expect(component.PaperItems).to.be.empty;
      });
    });
  });
});
