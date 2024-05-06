import path from 'path'; // node的path模块
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';


// 当前文件所在的路径。一般这段代码在webpack.config.js里面写 所以你总会觉得是项目根目录，实际是当前文件所在的目录
const pkgPath = path.resolve(__dirname, '../../packages');
console.log('pkgPath==>', pkgPath); // pkgPath==> /Users/xiangpeifang/Documents/work/usedaily/newReact/packages
// 实际的生产过程中，打出来的包应该在node modules， react是个依赖项
const distPath = path.resolve(__dirname, '../../dist/node_modules');
console.log('distPath==>', distPath); // distPath==> /Users/xiangpeifang/Documents/work/usedaily/newReact/dist/node_modules
// 解析包的路径
export const resolvePkgPath = (pkgName, isDist) => {
	// ...包路径
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
};

export const getPackageJSON = (pkgName) => {
	// ...包路径
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
};

export const getBaseRollupPlugins = ({ alias = { __DEV__: true }, typescript = {} }) => {
	return [replace(alias), cjs(), ts(typescript)];
};
