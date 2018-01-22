/**
 * this class is to get news rss feeds
 */

function formatContent(content) {
    var m,
        urls = [],
        rex = /<img[^>]+src="?([^"\s]+)"?[^>]*[\/]*>/g;

    while ( m = rex.exec( content ) ) {

        var rexWidth = /width="?([^"\s]+)"/g;
        var n = rexWidth.exec(m[0]);

        if(n != null && parseInt(n[1]) > 1){
            urls.push( m[1] );
        } else if(n == null){
            urls.push( m[1] );
        }

        content = content.replace(rex,'');
    }

    content = content.replace('\&lt;','<');
    content = content.replace('\&gt;','>');

    return {
        image:urls[0],
        content:content
    }
}

function onRssFetched(channels) {
    // limit number of articles;
    const LIMIT = 20;
    var articles = [];

    channels.forEach(function(channel){
        var channel_name = channel.channel_name;
        var arts = channel.articles;
        var savedArticles = channel.saved_articles;
        if(typeof arts != 'undefined'){
            arts = arts.slice(0, LIMIT);
            arts.forEach(function(article){
                //console.log("==========================================")
                //console.log(article.title)
                //console.log(article.link)
                var content = formatContent(article.content);
                var article_date = DateTime.newsPublishedDate(article.published);
                var isSaved = 0;
                for(var i = 0; i < savedArticles.length; i++){
                    if(article.title == savedArticles[i].heading && article_date == savedArticles[i].article_date){
                        isSaved = 1;
                        savedArticles.splice(i,1);
                        break;
                    }
                }

                var artic = {
                    channel:channel_name,
                    heading:article.title,
                    article_image:content.image,
                    content:content.content,
                    article_date:article_date,
                    url:article.link,
                    isSaved:isSaved
                };
                articles.push(artic);
            });
        }
    });
    return articles;
}

var NewsFeed = {

    getNewsFeed:function(data, callback){
        var feed = require('feed-read'),
            async = require('async'),
            channels = [];

        var queue = async.queue(function (param, done) {

            async.series([
                function getArticles(done){

                    var url = param.url;
                    var cha = {
                        channel_id:param.id,
                        channel_name:param.name,
                        channel_url:param.url,
                        saved_articles:param.articles
                    };

                    feed(url, function (err, articles) {
                        cha.articles = articles;
                        channels.push(cha);
                        done(null, channels);
                    });
                }
            ], function(err, results){
                done(results);
            });

        }, data.length);

        queue.drain = function() {
            var reOrderedResultSet = onRssFetched(channels);
            callback(reOrderedResultSet);
        };

        for(var i=0;i<data.length ;i++){
            (function(i){
                queue.push(data[i]);
            })(i);
        }

    }

};

module.exports = NewsFeed;