const path = require("path");

const PATHS = {
    src: path.join(__dirname, 'src'),
    img: path.join(__dirname, 'src/assets'),
    styles: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'dist')
}

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
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]'
                }
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