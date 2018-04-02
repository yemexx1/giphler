Feature('Giphler');

var elements = {
    giphysSpace: '#giphys_space',
    giphysTopLoader: '#giphys_top_loader',
    giphysBottomLoader: '#giphys_bottom_loader',
    giphys: '#giphys',
    moreButton: '#more',
    noResultsInfo: '#no_results_info',
    errorDash: '#error_dash',
    searchButton: '#search_button',
    searchInput: '#search_input',
    backToTop: '#back_to_top',
    modeIndicator: '#mode_indicator',
    backToTrendingButton: '#back_to_trending_btn'
};

Scenario('First Load', function (I) {
    I.amOnPage('/');
    I.seeInTitle('Giphler');
    I.see('Giphler');

    // confirm search elements
    I.seeElement(elements.searchInput);
    I.seeElement(elements.searchButton);
    I.seeElement(elements.searchButton + '[disabled]');

    I.seeElement(elements.giphysTopLoader);
    I.dontSeeElement(elements.giphysBottomLoader);
    I.waitForInvisible(elements.giphysTopLoader);

    I.see('Trending GIFs');
    I.seeNumberOfVisibleElements('.card', 24);
    I.seeElement(elements.moreButton);
    I.dontSeeElement(elements.backToTrendingButton);
    I.dontSeeElement(elements.searchButton + '[disabled]');
});

Scenario('Search', function (I) {
    I.amOnPage('/');
    I.waitForInvisible(elements.giphysTopLoader);

    I.fillField('#search_input', 'hello');
    I.pressKey('Enter');

    I.seeElement(elements.searchButton + '[disabled]');
    I.seeElement(elements.giphysTopLoader);
    I.waitForInvisible(elements.giphysTopLoader);

    I.see('Showing results for hello');
    I.seeNumberOfVisibleElements('.card', 24);
    I.seeElement(elements.backToTrendingButton);
    I.seeElement(elements.moreButton);
});

Scenario('Search With No Results', function (I) {
    I.amOnPage('/');
    I.waitForInvisible(elements.giphysTopLoader);

    I.fillField('#search_input', 'dasdjasdasdajsda');
    I.click(elements.searchButton);
    I.waitForInvisible(elements.giphysTopLoader);

    I.dontSee('Showing results for dasdjasdasdajsda');
    I.dontSeeElement('.card');
    I.seeElement(elements.backToTrendingButton);
    I.dontSeeElement(elements.moreButton);
});

Scenario('Load More', function (I) {
    I.amOnPage('/');
    I.waitForInvisible(elements.giphysTopLoader);

    I.click(elements.moreButton);
    I.seeElement(elements.moreButton + '[disabled]');
    I.seeTextEquals('Loading...', elements.moreButton);
    I.seeElement(elements.giphysBottomLoader);
    I.dontSeeElement(elements.giphysTopLoader);

    I.waitForInvisible(elements.giphysBottomLoader);
    I.seeNumberOfVisibleElements('.card', 48);
    I.dontSeeElement(elements.moreButton + '[disabled]');
    I.seeTextEquals('Load More', elements.moreButton);
});

Scenario('Back To Trending', function (I) {
    I.amOnPage('/');
    I.waitForInvisible(elements.giphysTopLoader);
    I.fillField('#search_input', 'hello');
    I.pressKey('Enter');

    I.click(elements.backToTrendingButton);
    I.seeElement(elements.giphysTopLoader);
    I.waitForInvisible(elements.giphysTopLoader);

    I.see('Trending GIFs');
    I.seeNumberOfVisibleElements('.card', 24);
    I.seeElement(elements.moreButton);
});

Scenario('Back To Top', function (I) {
    I.amOnPage('/');
    I.waitForInvisible(elements.giphysTopLoader);

    I.scrollPageToBottom();
    I.seeElement(elements.backToTop);

    I.scrollPageToTop();
    I.dontSeeElement(elements.backToTop);

    I.scrollPageToBottom();

    I.click(elements.backToTop);
});