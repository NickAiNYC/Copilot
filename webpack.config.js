// webpack.config.js - Build configuration

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'inline-source-map',
    
    entry: {
      'service-worker': './src/background/service-worker.js',
      'content-script': './src/content/content-script.js',
      'popup': './src/popup/popup.js',
      'sidebar': './src/sidebar/index.jsx'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    
    resolve: {
      extensions: ['.js', '.jsx']
    },
    
    plugins: [
      new CopyPlugin({
        patterns: [
          { 
            from: 'public/manifest.json', 
            to: 'manifest.json' 
          },
          { 
            from: 'public/icons', 
            to: 'icons',
            noErrorOnMissing: true
          },
          {
            from: 'public/popup.html',
            to: 'popup.html'
          },
          {
            from: 'public/sidebar.html',
            to: 'sidebar.html'
          },
          {
            from: 'public/sidebar.css',
            to: 'sidebar.css',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    
    optimization: {
      minimize: isProduction,
      splitChunks: false
    }
  };
};
