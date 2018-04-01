var Giphler = {};
(function (context) {
    var apiHost = 'https://api.giphy.com',
        apiKey = 'dc6zaTOxFJmzC',
        resourcePaths = {
            trending: '/v1/gifs/trending',
            search: '/v1/gifs/search'
        },
        selectors = {
            giphysSpace: 'giphys_space',
            giphysTopLoader: 'giphys_top_loader',
            giphysBottomLoader: 'giphys_bottom_loader',
            giphys: 'giphys',
            moreButton: 'more',
            noResultsInfo: 'no_results_info',
            errorDash: 'error_dash',
            searchButton: 'search_button',
            searchInput: 'search_input',
            backToTop: 'back_to_top',
            modeIndicator: 'mode_indicator',
            backToTrendingButton: 'back_to_trending_btn'
        },
        elements = {
            moreButton: document.getElementById(selectors.moreButton),
            giphysTopLoader: document.getElementById(selectors.giphysTopLoader),
            giphysBottomLoader: document.getElementById(selectors.giphysBottomLoader),
            giphysSpace: document.getElementById(selectors.giphysSpace),
            giphys: document.getElementById(selectors.giphys),
            noResultsInfo: document.getElementById(selectors.noResultsInfo),
            errorDash: document.getElementById(selectors.errorDash),
            searchButton: document.getElementById(selectors.searchButton),
            searchInput: document.getElementById(selectors.searchInput),
            backToTop: document.getElementById(selectors.backToTop),
            modeIndicator: document.getElementById(selectors.modeIndicator),
            backToTrendingButton: document.getElementById(selectors.backToTrendingButton)
        };

    const MODE_TRENDING = 'trending';
    const MODE_SEARCHING = 'search';

    context.numberOfGiphys = 0;
    context.mode = MODE_TRENDING;
    context.searchQuery = null;

    context.init = function () {
        elements.moreButton.addEventListener('click', context.loadMore);

        elements.backToTop.addEventListener('click', function () {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });

        elements.searchButton.addEventListener('click', function () {
            Giphler.getSearchResults(elements.searchInput.value);
        });

        elements.searchInput.addEventListener('keyup', function () {
            if (this.value.length > 0) {
                elements.searchButton.removeAttribute('disabled');
                if (event.keyCode === 13) {
                    elements.searchButton.click();
                }
            } else {
                elements.searchButton.setAttribute('disabled', 'disabled');
            }
        });

        window.addEventListener('scroll', function () {
            var bounds = elements.searchInput.getBoundingClientRect();
            var html = document.documentElement;
            var isVisible = bounds.top >= 0 && bounds.left >= 0 && bounds.bottom <= (window.innerHeight || html.clientHeight) &&
                bounds.right <= (window.innerWidth || html.clientWidth);
            if (isVisible) {
                elements.backToTop.classList.add('d-none');
            } else {
                elements.backToTop.classList.remove('d-none');
            }
        });

        elements.backToTrendingButton.addEventListener('click', function () {
            elements.searchInput.value = '';
            context.getTrending()
        });

        context.numberOfGiphys = 0;
        context.showLoading(false);
        context.getTrending();
    };

    context.showLoading = function (loadMore) {
        elements.noResultsInfo.classList.add('d-none');
        elements.errorDash.classList.add('d-none');
        if (loadMore) {
            elements.giphysBottomLoader.classList.remove('d-none');
            elements.giphysSpace.classList.remove('d-none');
            elements.giphysTopLoader.classList.add('d-none');
            elements.moreButton.setAttribute('disabled', 'true');
            elements.moreButton.innerHTML = 'Loading...';
        } else {
            elements.giphysSpace.classList.add('d-none');
            elements.giphysTopLoader.classList.remove('d-none');
            elements.giphysBottomLoader.classList.add('d-none');
        }
    };

    context.endLoading = function () {
        elements.moreButton.removeAttribute('disabled');
        elements.moreButton.innerHTML = 'Load More';
        elements.giphysTopLoader.classList.add('d-none');
        elements.giphysBottomLoader.classList.add('d-none');
        elements.giphysSpace.classList.remove('d-none');
        elements.moreButton.classList.remove('d-none');
        elements.modeIndicator.classList.add('d-inline-block');
        elements.modeIndicator.classList.remove('d-none');
    };

    context.getTrending = function (loadMore) {
        var _loadMore = loadMore || false;
        context.mode = MODE_TRENDING;
        context.makeRequest(resourcePaths.trending, function (response) {
            var giphys = response.data;
            context.renderGiphys(giphys);
        }, _loadMore)
    };

    context.getSearchResults = function (query, loadMore) {
        var _loadMore = loadMore || false;
        if (query.length == 0) {
            return false;
        }

        context.mode = MODE_SEARCHING;
        context.searchQuery = query;

        context.makeRequest(resourcePaths.search + '?q=' + encodeURIComponent(query), function (response) {
            var giphys = response.data;
            context.renderGiphys(giphys);
        }, _loadMore)
    };

    context.renderGiphys = function (giphys) {
        var giphysSpace = elements.giphys;
        var giphyTemplate = document.getElementById('giphy_template').innerHTML;
        var imageBackgroundColours = ['#6c757d', '#343a40', '#20c997', '#007bff', '#17a2b8', '#fd7e14'];

        if (giphys.length == 0) {
            elements.noResultsInfo.classList.remove('d-none');
            elements.moreButton.classList.add('d-none');
            elements.giphysSpace.classList.remove('d-none');
            elements.modeIndicator.classList.remove('d-inline-block');
            elements.modeIndicator.classList.add('d-none');
            elements.backToTrendingButton.classList.remove('d-none');
            elements.backToTrendingButton.classList.add('d-inline-block');
            return;
        }

        if (giphys.length < 24) {
            elements.moreButton.classList.add('d-none');
        }

        giphys.forEach(function (giphy) {
            var giphyHolder = document.createElement('div');
            giphyHolder.classList.add('col-md-4');
            giphyHolder.classList.add('mb-4');
            giphyHolder.innerHTML = giphyTemplate;

            var cardImage = giphyHolder.getElementsByClassName('card-img')[0];
            cardImage.setAttribute('src', giphy.images.fixed_height.url);
            cardImage.setAttribute('alt', giphy.title);
            cardImage.setAttribute('width', giphy.images.fixed_height.width + 'px');
            cardImage.setAttribute('height', giphy.images.fixed_height.height + 'px');
            cardImage.style.opacity = 0;

            var randomIndex = Math.floor(Math.random() * imageBackgroundColours.length);
            giphyHolder.getElementsByClassName('card-text')[0].appendChild(document.createTextNode(giphy.title));
            giphyHolder.getElementsByClassName('card')[0].style.backgroundColor = imageBackgroundColours[randomIndex];
            giphyHolder.getElementsByClassName('card-link')[0].href = giphy.bitly_url;
            cardImage.onload = function () {
                giphyHolder.getElementsByClassName('card')[0].style.backgroundColor = 'transparent';
                cardImage.style.opacity = 1;
            };

            giphysSpace.appendChild(giphyHolder);
        });

        context.numberOfGiphys += giphys.length;

        if (context.mode == MODE_SEARCHING) {
            elements.backToTrendingButton.classList.remove('d-none');
            elements.backToTrendingButton.classList.add('d-inline-block');
            elements.modeIndicator.innerHTML = 'Showing results for <i>' + context.searchQuery + '</i>';
        } else {
            elements.backToTrendingButton.classList.add('d-none');
            elements.backToTrendingButton.classList.remove('d-inline-block');
            elements.modeIndicator.innerHTML = 'Trending Gifs';
        }
    };

    context.clearGiphys = function () {
        elements.giphys.innerHTML = '';
        context.numberOfGiphys = 0;
    };

    context.loadMore = function () {
        if (context.mode == MODE_TRENDING) {
            context.getTrending(true);
        } else {
            context.getSearchResults(context.searchQuery, true);
        }
    };

    context.makeRequest = function (resourcePath, responseCallback, loadMore) {

        var errorCallback = function () {
            context.endLoading();
            elements.errorDash.classList.remove('d-none');
            if (!loadMore) {
                elements.moreButton.classList.add('d-none');
            }
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        };

        if (typeof loadMore == 'undefined') {
            loadMore = false;
        }

        var httpRequest = new XMLHttpRequest();

        if (!httpRequest) {
            errorCallback();
        }

        context.showLoading(loadMore);

        httpRequest.onreadystatechange = function () {
            try {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        if (!loadMore) {
                            context.clearGiphys();
                        }
                        context.endLoading();
                        responseCallback(JSON.parse(httpRequest.responseText));
                    } else {
                        errorCallback(httpRequest.responseText);
                    }
                }
            } catch (e) {
                errorCallback(e);
            }
        };


        var url = apiHost + resourcePath;
        url += (resourcePath.indexOf('?') == -1) ? '?' : '&';
        var offset = (loadMore) ? (context.numberOfGiphys + 1) : 0;
        url = url + 'api_key=' + apiKey + '&offset=' + offset + '&limit=24';
        httpRequest.open('GET', url, true);
        httpRequest.send();

    };
})(Giphler);

Giphler.init();