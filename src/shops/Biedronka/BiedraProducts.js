import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';
import { pagesGlovo } from './pagesGlovo.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

export const BiedraProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});
	const rootSelector = 'div.grid__content > section';

	const getPageData = async (itemId, rootElement) => {
		const baseSelectors = `${rootElement} > section:nth-child(${itemId}) > div`;
		let selectorPrice;
		let selectorTitle;
		let selectorImageUrl;

		const getPrice = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > div > span`);
		const getTitle = () => page.waitForSelector(`${baseSelectors} > span > span`);
		const getImageUrl = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > img`);

		try {
			selectorPrice = await getPrice(3);
			selectorTitle = await getTitle();
			selectorImageUrl = await getImageUrl(1);
		} catch (e) {
			console.log('error get biedra page data', itemId);
		}

		if (selectorPrice && selectorTitle && selectorImageUrl) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const imageUrl = await page.evaluate((selectorImageUrl) => selectorImageUrl?.src, selectorImageUrl);

			const productTitle = title?.trim();
			const productPrice = price?.trim();
			const shop = 'biedronkas';

			const createCallback = () => console.log('create', productTitle, productPrice);
			// const createCallback = () => addNewProduct({ connection, shop, productTitle, productPrice, imageUrl });

			const updateCallback = (id) => console.log('update', productTitle, productPrice);
			// const updateCallback = (id) => updateProductPrice(connection, shop, id, productPrice);

			checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
		}
	};

	const getPages = async () => {
		// pagesGlovo.forEach(async (url) => {
		// console.log('Page:', url);
		if (pagesGlovo && pagesGlovo?.length > 0) {
			for (let pageId = 0; pageId <= pagesGlovo?.length; pageId++) {
				if (pagesGlovo[pageId]) {
					console.log('Page:', pagesGlovo[pageId]);
					await page.goto(pagesGlovo[pageId]);
					await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
					const gridCounter = await page.$('div.grid__content');
					const itemsCounter = (await page.$$(`div.store__body__dynamic-content`)).length;
					// for (let i = 1; i <= itemsCounter; i++) await getPageData(i, gridCounter[0]);

					console.log('counter', itemsCounter);
				}
			}
		}
		// });
	};

	const endConnection = async () => connection.end();

	await getPages();
	await endConnection();
	await browser.close();
};
