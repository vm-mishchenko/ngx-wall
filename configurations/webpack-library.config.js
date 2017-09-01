'use strict';

const path = require('path');
const webpack = require('webpack');
const libraryConfig = require('./library.config');

module.exports = {
    entry: {
        [`${libraryConfig.libraryName}.umd`]: root('lib/index.ts'),
        [`${libraryConfig.libraryName}.umd.min`]: root('lib/index.ts')
    },

    devtool: 'cheap-source-map',

    output: {
        path: root('dist'),
        filename: '[name].js',
        libraryTarget: 'umd'
    },

    externals: [
        'rxjs/Subject',
        '@angular/core',
        '@angular/common',
        '@angular/platform-browser'
    ],

    resolve: {
        extensions: [
            '.ts'
        ]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: [
                    'awesome-typescript-loader',
                    'angular2-template-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'raw-loader'
            },
            {
                test: /\.scss$/,
                loaders: [
                    'to-string-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true
        }),
    ]
};

function root(p) {
    return path.join(process.cwd(), p);
}