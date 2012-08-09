(function(context) {
    var Docs = function() {};

    Docs.prototype = {

        queryExamples: function () {
            var search = $('#search');
            var tExamples = _.template($('#examples').html());
            var tags = [], data;

            var fullResult = $.ajax({
                url: 'examples.json',
                dataType: 'json',
                success: function(r) {
                    data = _(r).chain()
                    .compact()
                    .map(function(r) {
                        r.words = (r.title.toLowerCase() + ' ' + (r.tags.toString()).toLowerCase()).match(/(\w+)/g);
                        return r;
                    })
                    .value();
                    _.delay(function () {tagList(tags);}, 10);
                    _.each(data, function(result){
                        $('#results').append(tExamples(result));
                        tags.push(result.tags);
                    });
                }
            });

            var tagList = function (tags) {
                var tTags = _.template($('#tags').html());

                var f = _.flatten(tags);
                var u = _.uniq(f);

                _.each(u, function(tag) {
                    $('#tag-list').append(tTags({'tag': tag}));
                });

                _.delay(function () {
                    $('#tag-list').find('a').on('click', tagFilter);
                }, 1);

                var tagFilter = function(e) {
                    e.preventDefault();
                    $('#results').empty();
                    var tag = $(this).attr('data-tag');

                    if (!$(this).hasClass('active')) {
                        $('#tag-list').find('a').removeClass('active');
                        $(this).addClass('active');

                        var filtered = find(tag.toLowerCase().match(/(\w+)/g));
                        _(filtered).each(function(p) {
                            $('#results').append(tExamples(p));
                        });
                    } else {
                        $(this).removeClass('active');
                        _.each(data, function(result){
                            $('#results').append(tExamples(result));
                        });
                    }
                }
            }

            var find = function(phrase) {
                var matches = _(data).filter(function(p) {
                    return _(phrase).filter(function(a) {
                        return _(p.words).any(function(b) {
                            return a === b || b.indexOf(a) === 0;
                        });
                    }).length === phrase.length;
                });

                return matches;
            };

            $('input', search).keyup(_(function() {
                $('#results').empty();
                var phrase = $('input', search).val();

                if (phrase.length >= 2) {
                    var matches = find(phrase.toLowerCase().match(/(\w+)/g));
                    $('#tag-list').find('a').removeClass('active');
                    _(matches).each(function(p) {
                        $('#results').append(tExamples(p));
                    });
                    if (matches.length) return;
                } else {
                    _.each(data, function(result){
                        $('#results').append(tExamples(result));
                    });
                }

                return false;
            }).debounce(100));
        },

        page: function() {
            $('#toggle-sections').find('a').click(function() {
                if ($('#demo').hasClass('active')) {
                    $(this).text('Back to demo');
                    $('#demo').removeClass('active');
                    $('#snippet').addClass('active');
                } else {
                    $(this).text('View the code');
                    $('#snippet').removeClass('active');
                    $('#demo').addClass('active');
                }
                return false;
            });
        },

        copyCode: function() {
            $('#copy').click(function() {
                if (document.selection) {
                                    var rangeD = document.body.createTextRange();
                                    rangeD.moveToElementText(document.getElementById('code'));
                                    rangeD.select();
                                } else if (window.getSelection) {
                                        var rangeW = document.createRange();
                                        rangeW.selectNode(document.getElementById('code'));
                                        window.getSelection().addRange(rangeW);
                                    }
                        return false;
            });
        },

        colorCode: function() {
            $('pre').addClass('prettyprint');
            prettyPrint();
        },

        searchIdx: function() {
            if (this._searchIdx) return this._searchIdx;
            this._searchIdx = [];
            var list = $('#docs > *');
            var title = '', content = '', anchor = '';
            for (var i = 0; i < list.length; i++) {
                if (list[i].tagName.match(/H/)) {
                    this._searchIdx.push({
                        anchor: anchor,
                        title: title,
                        title_lc: title.toLowerCase(),
                        content: content,
                        content_lc: content.toLowerCase()
                    });
                    title = $(list[i]).text();
                    anchor = '#' + $('a', list[i]).attr('name');
                    content = '';
                } else {
                    content = (content || '') + $(list[i]).text();
                }
            }
            return this._searchIdx;
        },

        search: function(q) {
            var q_lc = q.toLowerCase();
            var idx = this.searchIdx();
            var results = [], limit = 10;
            for (var i = 0; i < idx.length && results.length < limit; i++) {
                if (idx[i].title_lc.indexOf(q_lc) !== -1) {
                    results.push(idx[i]);
                }
            }
            for (i = 0; i < idx.length && results.length < limit; i++) {
                if (idx[i].content_lc.indexOf(q_lc) !== -1) {
                    results.push(idx[i]);
                }
            }
            return results;
        },

        bindSearch: function() {
            var that = this;
            var resDiv = $('<div class="search-results"></div>').appendTo('.doc-search');
            $('.doc-search input[type=text]').bind('keyup', function() {
                if (!this.value) return resDiv.hide();
                resDiv.show();
                var res = that.search(this.value);
                resDiv.html('');
                for (var i = 0; i < res.length; i++) {
                    var rd = $('<div class="search-result"></div>').appendTo(resDiv);
                    $('<a></a>').appendTo(rd)
                        .text(res[i].title)
                        .attr('href', res[i].anchor);
                }
            });
        },

        bindHeadings: function() {
            $('h1[id],h2[id],h3[id],h4[id]').click(function(ev) {
                window.location.hash = $(ev.currentTarget).attr('id');
            });
        }
    };

    window.Docs = Docs;
})(window);

