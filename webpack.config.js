const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/client/index.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: ['.js', '.jsx'],
        },
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/client/static/index.html' },
        { from: './src/client/static/usdr_logo.svg' },
      ],
    }),
  ],
};
