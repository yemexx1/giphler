var Giphler = {};
(function (context) {
    var apiHost = 'https://api.giphy.com',
        apiKey = 'dc6zaTOxFJmzC',
        resourcePaths = {
            trending: '/v1/gifs/trending',
            search: '/v1/gifs/search'
        },
        elements = {
            moreButton: document.getElementById('more'),
            giphysTopLoader: document.getElementById('giphys_top_loader'),
            giphysBottomLoader: document.getElementById('giphys_bottom_loader'),
            giphysSpace: document.getElementById('giphys_space'),
            giphys: document.getElementById('giphys'),
            noResultsInfo: document.getElementById('no_results_info'),
            errorDash: document.getElementById('error_dash'),
            searchButton: document.getElementById('search_button'),
            searchInput: document.getElementById('search_input'),
            backToTop: document.getElementById('back_to_top'),
            modeIndicator: document.getElementById('mode_indicator'),
            backToTrendingButton: document.getElementById('back_to_trending_btn')
        };

    const MODE_TRENDING = 'trending';
    const MODE_SEARCHING = 'search';
    const GIPHY_LIMIT = 24;

    context.numberOfGiphys = 0;
    context.mode = MODE_TRENDING;
    context.searchQuery = null;
    context.toLoadMore = false;

    context.init = function () {
        elements.moreButton.addEventListener('click', context.loadMore);

        elements.backToTop.addEventListener('click', function () {
            context.scrollToTop();
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

        context.showLoading(false);
        context.getTrending();
    };

    context.getTrending = function () {
        context.mode = MODE_TRENDING;
        context.getGiphys(resourcePaths.trending);
    };

    context.getSearchResults = function (query) {
        if (query.length == 0) {
            return false;
        }

        context.mode = MODE_SEARCHING;
        context.searchQuery = query;

        context.getGiphys(resourcePaths.search + '?q=' + encodeURIComponent(query));
    };

    context.getGiphys = function (resourcePath) {
        var loadMore = context.toLoadMore;
        context.toLoadMore = false;
        var offset = (loadMore) ? context.numberOfGiphys + 1 : 0;

        context.showLoading(loadMore);
        context.makeRequest(resourcePath, function (response) {
            if (!loadMore) {
                context.clearGiphys();
            }
            context.endLoading();
            context.renderGiphysSpace(response.data);
        }, offset)
    };

    context.renderGiphysSpace = function (giphys) {
        var giphysSpace = elements.giphys;

        if (giphys.length == 0) {
            context.show(elements.noResultsInfo);
            context.hide(elements.moreButton);
            context.show(giphysSpace);
            context.hide(elements.modeIndicator);
            context.show(elements.backToTrendingButton, true);
            return;
        }

        if (giphys.length < GIPHY_LIMIT) {
            elements.moreButton.classList.add('d-none');
        }

        giphys.forEach(function (giphy) {
            var giphyHolder = context.renderGiphy(giphy);
            giphysSpace.appendChild(giphyHolder);
        });

        context.numberOfGiphys += giphys.length;

        if (context.mode == MODE_SEARCHING) {
            context.show(elements.backToTrendingButton, true);
            elements.modeIndicator.innerHTML = 'Showing results for <i>' + context.searchQuery + '</i>';
        } else {
            context.hide(elements.backToTrendingButton);
            elements.modeIndicator.innerHTML = 'Trending GIFs';
        }
    };

    context.renderGiphy = function (giphy) {
        var giphyHolder = document.createElement('div');
        var giphyTemplate = document.getElementById('giphy_template').innerHTML;
        var imageBackgroundColours = ['#6c757d', '#343a40', '#20c997', '#007bff', '#17a2b8', '#fd7e14'];

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
        return giphyHolder;
    };

    context.clearGiphys = function () {
        elements.giphys.innerHTML = '';
        context.numberOfGiphys = 0;
    };

    context.loadMore = function () {
        context.toLoadMore = true;
        if (context.mode == MODE_TRENDING) {
            context.getTrending();
        } else {
            context.getSearchResults(context.searchQuery);
        }
    };

    context.makeRequest = function (resourcePath, responseCallback, offset) {
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
            context.showError();
        }

        httpRequest.onreadystatechange = function () {
            try {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        responseCallback(JSON.parse(httpRequest.responseText));
                    } else {
                        context.showError();
                    }
                }
            } catch (e) {
                context.showError();
            }
        };

        var url = apiHost + resourcePath;
        url += (resourcePath.indexOf('?') == -1) ? '?' : '&';
        url = url + 'api_key=' + apiKey + '&offset=' + offset + '&limit=' + GIPHY_LIMIT;
        httpRequest.open('GET', url, true);
        httpRequest.send();
    };

    context.showLoading = function (loadMore) {
        context.hide(elements.noResultsInfo);
        context.hide(elements.errorDash);
        elements.searchButton.setAttribute('disabled', 'disabled');

        if (loadMore) {
            elements.moreButton.setAttribute('disabled', 'true');
            elements.moreButton.innerHTML = 'Loading...';
            context.show(elements.giphysBottomLoader);
            context.hide(elements.giphysTopLoader);
            context.show(elements.giphysSpace);
        } else {
            context.hide(elements.giphysSpace);
            context.show(elements.giphysTopLoader);
            context.hide(elements.giphysBottomLoader);
        }
    };

    context.endLoading = function () {
        elements.moreButton.removeAttribute('disabled');
        elements.moreButton.innerHTML = 'Load More';
        elements.searchButton.removeAttribute('disabled');

        context.hide(elements.giphysTopLoader);
        context.hide(elements.giphysBottomLoader);
        context.show(elements.giphysSpace);
        context.show(elements.moreButton);
        context.show(elements.modeIndicator, true);
    };

    context.showError = function () {
        context.endLoading();
        context.show(elements.errorDash);
        if (document.getElementsByClassName('card').length == 0) {
            context.hide(elements.giphysSpace);
        }
        context.scrollToTop();
    };

    context.scrollToTop = function () {
        var scrollStep = -window.scrollY / (1000 / 15),
            scrollInterval = setInterval(function () {
                if (window.scrollY != 0) {
                    window.scrollBy(0, scrollStep);
                }
                else clearInterval(scrollInterval);
            }, 15);
    };

    context.hide = function (element) {
        element.classList.add('d-none');
        element.classList.remove('d-inline-block');
    };

    context.show = function (element, addInline) {
        addInline = addInline || false;
        element.classList.remove('d-none');
        if (addInline) {
            element.classList.add('d-inline-block');
        }
    }
})(Giphler);

Giphler.init();