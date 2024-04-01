import generatePackageJson from 'rollup-plugin-generate-package-json';
import { getPackageJSON, resolvePkgPath, getBaseRollupPlugins } from './utils';

const { name, module } = getPackageJSON('react');
// react包的路径
const pkgPath = resolvePkgPath(name);

// react产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
	// react包
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'react',
			format: 'umd' // 兼容commonjs 和es
		},
		plugins: [
			...getBaseRollupPlugins({}),
			generatePackageJson({
				inputFolder: pkgPath,
				outFolder: pkgDistPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					main: 'index.js'
				})
			})
		]
	},
	// jsx runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: [
			// jsx-runtime
			{
				file: `${pkgDistPath}/jsx-runtime.js`,
				name: 'jsx-runtime.js',
				format: 'umd' // 兼容commonjs 和es
			},
			// jsx-dev-runtime
			{
				file: `${pkgDistPath}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime.js',
				format: 'umd' // 兼容commonjs 和es
			}
		],
		plugins: getBaseRollupPlugins({})
	}
];
