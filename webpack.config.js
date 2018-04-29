var path = require('path');

var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var GitRevisionPlugin = require('git-revision-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');


const OUTPUT_DIRECTORY = 'dist';

function recursivelyCopy(dir) {
  return {from: dir, to: dir, toType: 'dir'};
}

function cleanUpLeftovers() {
  return new CleanWebpackPlugin(OUTPUT_DIRECTORY, {});
}

function copyStaticAssets() {
  return new CopyWebpackPlugin([
    recursivelyCopy('css'),
    recursivelyCopy('images'),
    recursivelyCopy('sprites'),
    recursivelyCopy('thirdparty'),
    'LICENSE',
    'COPYING',
  ]);
}

function injectBundleIntoHTML(gitHash) {
  return new HtmlWebpackPlugin({
    gitHash,
    inject: true,
    hash: true,
    template: './index.html',
    filename: 'index.html'
  });
}

function injectBuildIdIntoAbout(gitHash) {
  return new HtmlWebpackPlugin({
    gitHash,
    inject: false,
    hash: true,
    template: './about.html',
    filename: 'about.html'
  });
}

function deferInjectedBundle() {
  return new ScriptExtHtmlPlugin({
    defaultAttribute: 'defer'
  });
}

function addDevelopmentConfigTo(options) {
  options.devServer = {
    contentBase: `./${OUTPUT_DIRECTORY}`
  };

  options.devtool = 'source-maps';
  options.mode = 'development';
}

function getBuildId() {
  // Technically don't need to use the webpack plugin, as not passing it to Webpack...
  const gitPlugin = new GitRevisionPlugin({
    commitHashCommand: `log -1 --pretty=format:'%h' master`
  });

  return gitPlugin.commithash().slice(0, 12);
}

module.exports = function(env, argv) {
  const buildId = getBuildId();

  const typescriptThroughATL = {test: /\.ts$/, loader: "awesome-typescript-loader"};

  const options = {
    entry: './src/micropolis.js',
    mode: 'production',
    module: {
     rules: [
       typescriptThroughATL
      ]
    },
    output: {
      path: path.resolve(__dirname, OUTPUT_DIRECTORY),
      filename: 'src/micropolis.js'
    },
    plugins: [
      cleanUpLeftovers(),
      copyStaticAssets(),
      injectBundleIntoHTML(buildId),
      injectBuildIdIntoAbout(buildId),
      deferInjectedBundle()
    ],
    resolve: {
      extensions: [
        ".js", ".json", ".ts"
      ]
    }
  };

  if (env.development) {
    addDevelopmentConfigTo(options);
  }

  return options;
};
