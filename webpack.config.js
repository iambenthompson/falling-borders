const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app.js' // bundle's entry point
    },
    output: {
        path: path.join(__dirname, 'dist'), // output directory
        filename: '[name].bundle.js' // name of the generated bundle
    },
    plugins: [new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body'
    })],
    module: {
        rules: [{
            loader: 'babel-loader',
            test: /\.js$/,
            exclude: /node_modules/,
            options: {
                presets: ['env']
            }
        }]
    },
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        contentBase: path.resolve(__dirname, './dist'),
        stats: 'errors-only',
        disableHostCheck: true
    }    
};