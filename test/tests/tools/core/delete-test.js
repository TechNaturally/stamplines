describe('Tools.Core.Delete', () => {
  let Delete;
  before(() => {
    Test.assertSL();
    Delete = new Test.Lib.Tools.Core.Delete(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Delete).to.exist;
    });
    it('should be constructed by Delete', () => {
      expect(Delete.constructor.name).to.equal('Delete');
    });
  });
  describe('#DeleteSelected', () => {
    let testItems;
    let Select;
    before(() => {
      Select = Delete.Belt.Belt.Select;
    });
    beforeEach(() => {
      testItems = [
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 20, 20, 40, 60),
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 100, 100, 20, 40),
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 75, 75, 20, 40),
        Select.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 20, y: 20}, {x: 40, y: 60}),
        Select.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 75, y: 75}, {x: 20, y: 40})
      ];
      for (let item of testItems) {
        Select.Select(item);
      }
    });
    afterEach(() => {
      for (let item of testItems) {
        Select.SL.Paper.destroyPaperItem(item);
      }
    });
    it('should call Select.Unselect for each of Select.Items', () => {
      let spy = sinon.spy(Select, 'Unselect');
      let selectItems = Select.Items.slice();
      Delete.DeleteSelected();
      for (let item of selectItems) {
        expect(spy.withArgs(item).callCount).to.equal(1);
      }
      Select.Unselect.restore();
    });
    it('should call Paper.destroyPaperItem for each of Select.Items', () => {
      let spy = sinon.spy(Delete.SL.Paper, 'destroyPaperItem');
      let selectItems = Select.Items.slice();
      Delete.DeleteSelected();
      for (let item of selectItems) {
        expect(spy.withArgs(item).callCount).to.equal(1);
      }
      Delete.SL.Paper.destroyPaperItem.restore();
    });
  });
  describe('#onKeyUp', () => {
    describe('when called with event.key=="backspace"', () => {
      it('should call #DeleteSelected', () => {
        let spy = sinon.spy(Delete, 'DeleteSelected');
        Delete.onKeyUp( {key: 'backspace'} );
        expect(spy.callCount).to.equal(1);
        Delete.DeleteSelected.restore();
      });
    });
  });
});
