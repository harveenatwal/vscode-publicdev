//@ts-check

/** @type {import('@twbs/fantasticon').RunnerOptions} */
const config = {
	name: 'pdicons',
	prefix: 'pdicon',
	codepoints: require('./images/icons/templates/mapping.json'),
	inputDir: './images/icons',
	outputDir: './dist',
	fontsUrl: '#{root}/dist',
	// @ts-ignore
	fontTypes: ['woff2'],
	normalize: true,
	// @ts-ignore
	assetTypes: ['html', 'scss', 'json'],
	templates: {
		html: './images/icons/templates/contribute-icons-map.hbs',
	},
	formatOptions: {
		json: {
			indent: 2,
		},
	},
	pathOptions: {
		woff2: './dist/pdicons.woff2',
		html: './dist/icons-contribution.json',
		json: './images/icons/templates/mapping.json',
	},
};

module.exports = config;