import { GameshowPage } from './app.po';

describe('gameshow App', function() {
  let page: GameshowPage;

  beforeEach(() => {
    page = new GameshowPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
