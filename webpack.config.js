const path = require("path");

module.exports = {
    entry: {
        index: path.resolve(__dirname, "src", "videojsadx.js"),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
    },
    output: {
        library: 'dist',
        libraryTarget: 'umd',
        filename: 'videojsadx.js',
        auxiliaryComment: 'VideojsAdx bundle',
        clean: {
            keep: /ignored\/dir\//, // Keep these assets under 'ignored/dir'.
        },
    }
};