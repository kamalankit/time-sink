module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-typescript', { 
        allowDeclareFields: true,
        allowNamespaces: true
      }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};