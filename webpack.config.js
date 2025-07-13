import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { GitRevisionPlugin } from 'git-revision-webpack-plugin';
import HtmlWebpackPlugin  from 'html-webpack-plugin';
import path from 'path';

// Workaround now this is a module...
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const StripAssertionCode = require('ts-transformer-unassert').default;

const ADD_TS_EXTENSIONS_TO_WEPACK = [".ts", ".tsx", ".js"];
const SUPPORT_FULLY_QUALIFIED_TS_ESM_IMPORTS = {
  ".js": [".js", ".ts"],
  ".cjs": [".cjs", ".cts"],
  ".mjs": [".mjs", ".mts"],
};
const HANDLE_TYPESCRIPT_WITH_TS_LOADER = { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" };

const OUTPUT_DIRECTORY = 'dist';

function recursivelyCopy(dir) {
  return {from: dir, to: dir, toType: 'dir'};
}

function cleanUpLeftovers() {
  return new CleanWebpackPlugin();
}

function copyStaticAssets() {
  return new CopyPlugin({
    "patterns": [
      recursivelyCopy('css'),
      recursivelyCopy('images'),
      recursivelyCopy('sprites'),
      'LICENSE',
      'COPYING',
    ]
  });
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

function addDevelopmentConfigTo(options) {
  options.devServer = {
    contentBase: `./${OUTPUT_DIRECTORY}`
  };

  options.devtool = 'source-maps';
  options.mode = 'development';
}

function addProductionConfigTo(options) {
  /*
  const assertionStrippingConfig = {
    options: {
      getCustomTransformers: () => {
        return ({before: [StripAssertionCode]});
      }
    }
  };
  stripTSAssertionsRule = Object.assign(assertionStrippingConfig, HANDLE_TYPESCRIPT_WITH_ATL);
  options.module.rules.push(stripTSAssertionsRule);
  */
}

function getBuildId() {
  // Technically don't need to use the webpack plugin, as not passing it to Webpack...
  const gitPlugin = new GitRevisionPlugin({
    commitHashCommand: `log -1 --pretty=format:'%h' main`
  });

  return gitPlugin.commithash().slice(0, 12);
}

function commonOptions() {
  const buildId = getBuildId();

  const options = {
    entry: './src/micropolis.js',
    resolve: {
      extensions: ADD_TS_EXTENSIONS_TO_WEPACK,
      extensionAlias: SUPPORT_FULLY_QUALIFIED_TS_ESM_IMPORTS,
    },
    module: {
      rules: [
        HANDLE_TYPESCRIPT_WITH_TS_LOADER,
      ],
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
    ],
  };

  return options;
}

export default function(env, argv) {
  let options = commonOptions();

  if (env.development) {
    addDevelopmentConfigTo(options);
  } else {
    addProductionConfigTo(options);
  }

  return options;
};
