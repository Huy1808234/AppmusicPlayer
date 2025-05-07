const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = {
  resolver: {
    blacklistRE: exclusionList([
      /.*\/AppMusic\/AppMusic\/.*/, // loại bỏ thư mục bị lặp nếu có
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
