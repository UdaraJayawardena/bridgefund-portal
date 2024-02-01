/* config-overrides.js */
const webpack = require('webpack');
module.exports = function override(config, env) {
    //do stuff with the webpack config...

    config.resolve.fallback = {
        // url: require.resolve('url'),
        // assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),//installed
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),//installed
        os: require.resolve('os-browserify/browser'),//installed
        buffer: require.resolve('buffer'),//installed
        stream: require.resolve('stream-browserify'),//installed
        querystring: require.resolve('querystring-es3') //installed
    };
    config.resolve.alias = {
      querystring: 'querystring-es3'
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            // process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    );

    config.module.rules = config.module.rules.map(rule => {
      if (rule.oneOf instanceof Array) {
        rule.oneOf[rule.oneOf.length - 1].exclude = [/\.(js|mjs|jsx|cjs|ts|tsx)$/, /\.html$/, /\.json$/];
      }
      return rule;
    });

    return config;
}
