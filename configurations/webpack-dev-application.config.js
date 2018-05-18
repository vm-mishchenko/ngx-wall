'use strict';

const libraryConfig = require('./library.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

module.exports = {
    entry: {
        main: root('dev-application/main.jit.ts'),
        polyfills: root('dev-application/polyfills.ts')
    },

    output: {
        path: root('dev-application-dist'),
        filename: '[name].bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: '@ngtools/webpack',
                        options: {
                            tsConfigPath: root('/dev-application/tsconfig.json')
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                loader: 'raw-loader'
            },
            {
                test: /\.css/,
                loaders: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                include: root('dev-application/app'),
                loader: ExtractTextPlugin.extract({
                    use: [
                        'css-loader',
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader'
            }
        ]
    },

    plugins: [
        new webpack.ProgressPlugin(),

        new HtmlWebpackPlugin({
            template: root('dev-application/index.html')
        }),

        new ExtractTextPlugin('styles.css'),

        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular[\\\/]core[\\\/]@angular/,
            path.join(process.cwd(), 'src')
        ),

        new AngularCompilerPlugin({
            tsConfigPath: root('/dev-application/tsconfig.json'),
            entryModule: root('/dev-application/app/app.module#AppModule'),
            sourceMap: true
        })
    ],

    resolve: {
        alias: (() => {
            return {
                [libraryConfig.moduleName]: root(`dist`)
            }
        })(),

        mainFiles: ['index', `${libraryConfig.libraryName}.umd`],

        modules: ['node_modules'],

        extensions: ['.ts', '.js']
    },

    devServer: {
        contentBase: './src',
        port: 9000,
        hot: false,
        inline: false,
        historyApiFallback: true,
        stats: 'errors-only',
        watchOptions: {
            aggregateTimeout: 300,
            poll: 500
        }
    },

    stats: 'errors-only',

    devtool: 'cheap-source-map'
};

function root(p) {
    return path.join(process.cwd(), p);
}