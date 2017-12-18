const path = require('path');

module.exports = {
    entry: "./app.js", // bundle's entry point
    output: {
        path: path.resolve(__dirname, 'dist'), // output directory
        filename: "[name].js" // name of the generated bundle
    }
};
