var Giphler = {};
(function (context) {
    var apiHost = 'http://api.giphy.com',
        apiKey = 'dc6zaTOxFJmzC',
        resourcePaths = {
            trending: '/v1/gifs/trending',
            search: '/v1/gifs/search'
        },
        selectors = {
            giphysSpace: 'giphys_space',
            giphysLoader: 'giphys_loader',
            giphys: 'giphys',
            moreButton: 'more'
        },
        elements = {
            moreButton: document.getElementById(selectors.moreButton),
            giphysLoader: document.getElementById(selectors.giphysLoader),
            giphysSpace: document.getElementById(selectors.giphysSpace),
            giphys: document.getElementById(selectors.giphys)
        };

    const MODE_TRENDING = 'trending';
    const MODE_SEARCHING = 'search';

    context.numberOfGiphys = 0;
    context.mode = MODE_TRENDING;
    context.searchQuery = null;

    context.init = function () {
        context.numberOfGiphys = 0;
        context.showLoading();
        context.getTrending();
    };

    context.showLoading = function () {
        elements.moreButton.setAttribute('disabled', 'true');
        elements.moreButton.innerHTML = 'Loading...';
        elements.giphysLoader.classList.remove('d-none');
        elements.giphysSpace.classList.add('d-none');
    };

    context.endLoading = function () {
        elements.moreButton.removeAttribute('disabled');
        elements.moreButton.innerHTML = 'Load More';
        elements.giphysLoader.classList.add('d-none');
        elements.giphysSpace.classList.remove('d-none');
    };

    context.getTrending = function () {
        if (context.mode == MODE_SEARCHING) {
            elements.giphys.innerHTML = '';
            context.numberOfGiphys = 0;
        }

        context.mode = MODE_TRENDING;
        context.makeRequest(resourcePaths.trending, function () {
        }, function (response) {
            var giphys = response.data;
            context.renderGiphys(giphys);
            context.endLoading();
        })
    };

    context.getSearchResults = function (query) {
        if (query.length == 0) {
            return false;
        }

        context.mode = MODE_SEARCHING;
        context.searchQuery = query;

        context.makeRequest(resourcePaths.search + '?q=' + encodeURIComponent(query), function () {
            if (context.numberOfGiphys == 0) {
                context.showLoading();
                elements.giphys.innerHTML = '';
            }
        }, function (response) {
            var giphys = response.data;
            context.renderGiphys(giphys);
            context.endLoading();
        })
    };

    context.renderGiphys = function (giphys) {
        var giphysSpace = elements.giphys;
        var giphyTemplate = document.getElementById('giphy_template').innerHTML;
        var imageBackgroundColours = ['#6c757d', '#343a40', '#20c997', '#007bff', '#17a2b8', '#fd7e14'];

        giphys.forEach(function (giphy) {
            var giphyHolder = document.createElement('div');
            giphyHolder.classList.add('col-4');
            giphyHolder.classList.add('mb-4');
            giphyHolder.innerHTML = giphyTemplate;

            var cardImage = giphyHolder.getElementsByClassName('card-img')[0];
            cardImage.setAttribute('src', giphy.images.fixed_height.url);
            cardImage.setAttribute('width', giphy.images.fixed_height.width + 'px');
            cardImage.setAttribute('height', giphy.images.fixed_height.height + 'px');
            cardImage.style.opacity = 0;

            var randomIndex = Math.floor(Math.random() * imageBackgroundColours.length);
            giphyHolder.getElementsByClassName('card')[0].style.backgroundColor = imageBackgroundColours[randomIndex];
            cardImage.onload = function () {
                giphyHolder.getElementsByClassName('card')[0].style.backgroundColor = 'transparent';
                cardImage.style.opacity = 1;
            };

            giphysSpace.appendChild(giphyHolder);
        });

        context.numberOfGiphys += giphys.length;
    };

    context.loadMore = function () {
        if (context.mode == MODE_TRENDING) {
            context.getTrending();
        } else {
            context.getSearchResults(context.searchQuery);
        }
    };

    context.makeRequest = function (resourcePath, loadingCallback, responseCallback, errorCallback) {
        if (typeof errorCallback == 'undefined') {
            errorCallback = function (error) {
                console.log('There was a problem with the request.');
                console.log(error);
            }
        }

        loadingCallback();

        var httpRequest = new XMLHttpRequest();

        if (!httpRequest) {
            errorCallback();
        }

        httpRequest.onreadystatechange = function () {
            try {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
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
        url = url + 'api_key=' + apiKey + '&offset=' + (context.numberOfGiphys + 1);
        httpRequest.open('GET', url, true);
        httpRequest.send();

    };
})(Giphler);

Giphler.init();

var searchButton = document.getElementById('search_button');
var searchInput = document.getElementById('search_input');
document.getElementById('more').addEventListener('click', Giphler.loadMore);

searchButton.addEventListener('click', function () {
    Giphler.numberOfGiphys = 0;
    Giphler.getSearchResults(searchInput.value);
});

searchInput.addEventListener('keyup', function () {
    if (this.value.length > 0) {
        searchButton.removeAttribute('disabled');
    } else {
        searchButton.setAttribute('disabled', 'disabled');
    }
});
