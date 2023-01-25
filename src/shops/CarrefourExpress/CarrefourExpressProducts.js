import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';
import { pagesGlovo } from './pagesGlovo.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

export const CarrefourExpressProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});

	const rootSelector = (gridNumber) =>
		`div.store__body__dynamic-content > div:nth-child(${gridNumber}) > div.list__container > div`;

	const getPageData = async (itemId, gridNumber) => {
		const baseSelectors = `${rootSelector(gridNumber)}:nth-child(${itemId}) > div`;
		let selectorPrice;
		let selectorTitle;
		let selectorImageUrl;

		const getPrice = (index) =>
			page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > div > div:nth-child(2) > div > span`);
		const getTitle = () =>
			page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > div > div:nth-child(1) > span`);
		const getImageUrl = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > img`);

		try {
			selectorPrice = await getPrice(2);
			selectorTitle = await getTitle(1);
			selectorImageUrl = await getImageUrl(1);
		} catch (e) {
			console.log('error get biedra page data', itemId);
		}

		if (selectorPrice && selectorTitle && selectorImageUrl) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const url = await page.evaluate((selectorImageUrl) => selectorImageUrl?.src, selectorImageUrl);

			const productTitle = title?.trim();
			const productPrice = price?.trim();
			const imageUrl = url.trim();
			const shop = 'carrefourexpresss';

			// const createCallback = () => console.log('create', productTitle, productPrice);
			const createCallback = async () => addNewProduct({ connection, shop, productTitle, productPrice, imageUrl });

			// const updateCallback = (id) => console.log('update', productTitle, productPrice);
			const updateCallback = async (id) => updateProductPrice(connection, shop, id, productPrice);

			checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
		}
	};

	const getPages = async () => {
		if (pagesGlovo && pagesGlovo?.length > 0) {
			for (let pageId = 0; pageId <= pagesGlovo?.length; pageId++) {
				if (pagesGlovo[pageId]) {
					await page.goto(pagesGlovo[pageId]);
					await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
					const gridCounter = (await page.$$(`div.store__body__dynamic-content > div > div.grid__content`))?.length;

					const countItems = async () => {
						console.log('Page:', pagesGlovo[pageId]);
						for (let gridNumber = 1; gridNumber <= gridCounter; gridNumber++) {
							const itemsCounter = (await page.$$(rootSelector(gridNumber)))?.length;

							for (let i = 1; i <= itemsCounter; i++) await getPageData(i, gridNumber);
						}
					};
					await countItems();
				}
			}
		}
	};

	const endConnection = async () => connection.end();

	await getPages();
	// await endConnection();
	await browser.close();
};
