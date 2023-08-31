const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    lobby: './src/app/lobby/index',
    game: './src/app/game/index'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Game Lobby',
      chunks: ['lobby'],
      filename: 'index_lobby.html'
    }),
    new HtmlWebpackPlugin({
      title: 'Room',
      chunks: ['game'],
      filename: 'index_game.html'
    }),
  ],
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  devServer: {
    port: 8080,
    proxy: {
      '/proxy': {
        target: 'http://localhost:3000',
        secure: false
      }
    },
  },
  module: {
    rules: [
    //css and sass
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    //jsx
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    // ts
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js','.tsx', '.ts']
  }
}
