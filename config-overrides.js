const { override, fixBabelImports, addWebpackPlugin, useBabelRc, disableEsLint } = require('customize-cra');
const {injectBabelPlugin} = require('react-app-rewired');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

 module.exports = override(
   fixBabelImports('antd', {
     libraryDirectory: 'es',
     style: 'css',
   }),
   addWebpackPlugin(new AntdDayjsWebpackPlugin()),
   disableEsLint(),
   useBabelRc()
 );
