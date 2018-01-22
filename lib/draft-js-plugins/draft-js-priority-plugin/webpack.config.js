var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        filename: 'index.js',
        path: path.resolve('./lib')
    },
    resolve: {
        modules: ['node_modules', './public/lib'],
        extensions: ['.js', '.jsx', '.css', '.json']
    },
    module: {
        loaders: [
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                loaders: ['babel-loader']
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader')
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css-loader')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("styles.css"),
    ]
};