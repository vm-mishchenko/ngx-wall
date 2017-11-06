'use strict';

const path = require('path');
const webpack = require('webpack');
const libraryConfig = require('./library.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['.ts', '.js']
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
                include: root('lib/resources'),
                loader: ExtractTextPlugin.extract({
                    use: [
                        'css-loader',
                        'sass-loader'
                    ]
                })
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin(`${libraryConfig.libraryName}.css`)
    ]
};

function root(p) {
    return path.join(process.cwd(), p);
}