const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: isProd ? './' : '/',
    },
    devtool: isProd ? false : 'eval-source-map',
    module: {
      rules: [
        { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
        { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './index.html' }),

      // Позволяет использовать __API_URL__ в коде
      new webpack.DefinePlugin({
        __API_URL__: JSON.stringify(
          isProd
            ? 'https://workers-backend-kdx2.onrender.com' // URL с Render
            : '/api/news'                                  // проксируется на localhost:3000
        ),
        __IS_PROD__: JSON.stringify(isProd),
      }),

      // Service Worker ТОЛЬКО для production
      ...(isProd
        ? [
            new GenerateSW({
              clientsClaim: true,
              skipWaiting: true,
            }),
          ]
        : []),
    ],

    // РЕЖИМ ОТЛАДКИ
    devServer: {
      static: { directory: path.join(__dirname, 'dist') },
      port: 8080,
      hot: true,
      open: true,      
      historyApiFallback: true,
      client: { overlay: true },
      // Прокси на бэкенд, чтобы не ловить CORS при разработке
      proxy: [
        {
          context: ['/api'],
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      ],
    },
  };
};