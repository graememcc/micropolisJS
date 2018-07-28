const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
const StripAssertionCode = require('ts-transformer-unassert').default;

const HANDLE_TYPESCRIPT_WITH_ATL = {test: /\.ts$/, loader: "awesome-typescript-loader"};

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

function addProductionConfigTo(options) {
  options.mode = 'production';

  removeATLRuleFrom(options.module);
  const assertionStrippingConfig = {
    options: {
      getCustomTransformers: () => {
        return ({before: [StripAssertionCode]});
      }
    }
  };
  stripTSAssertionsRule = Object.assign(assertionStrippingConfig, HANDLE_TYPESCRIPT_WITH_ATL);
  options.module.rules.push(stripTSAssertionsRule);
}

function removeATLRuleFrom(webpackModuleOptions) {
  webpackModuleOptions.rules = webpackModuleOptions.rules.filter((rule) => rule !== HANDLE_TYPESCRIPT_WITH_ATL);
}

function getBuildId() {
  // Technically don't need to use the webpack plugin, as not passing it to Webpack...
  const gitPlugin = new GitRevisionPlugin({
    commitHashCommand: `log -1 --pretty=format:'%h' master`
  });

  return gitPlugin.commithash().slice(0, 12);
}

function commonOptions() {
  const buildId = getBuildId();

  const options = {
    entry: './src/micropolis.js',
    module: {
      rules: [
        HANDLE_TYPESCRIPT_WITH_ATL
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

  return options;
}

module.exports = function(env, argv) {
  const options = commonOptions();

  if (env.development) {
    addDevelopmentConfigTo(options);
  } else {
    addProductionConfigTo(options);
  }

  return options;
};
