import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

export const CarrefourProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const timeout = { timeout: 10 };
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});

	const rootSelector = 'div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(5) > div > div > div';

	const getPageData = async (itemId) => {
		const baseSelectors = `${rootSelector}:nth-child(${itemId}) > div`;
		let selectorPrice;
		let selectorPriceRest;
		let selectorTitle;

		const getPrice = (index) =>
			page.waitForSelector(
				`${baseSelectors} > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)`,
				timeout,
			);
		const getPriceRest = (index) =>
			page.waitForSelector(
				`${baseSelectors} > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)`,
				timeout,
			);

		try {
			selectorTitle = await page.waitForSelector(`${baseSelectors} > div.MuiBox-root > a.MuiButtonBase-root`, timeout);
			selectorPrice = await getPrice(4);
			selectorPriceRest = await getPriceRest(4);
		} catch (e) {
			try {
				selectorPrice = await getPrice(3);
				selectorPriceRest = await getPriceRest(3);
			} catch (e) {
				try {
					selectorPrice = await getPrice(5);
					selectorPriceRest = await getPriceRest(5);
				} catch (e) {
					try {
						selectorPrice = await getPrice(6);
						selectorPriceRest = await getPriceRest(6);
					} catch (e) {
						// console.log(e);
					}
				}
			}
		}

		if (selectorPrice && selectorTitle && selectorPriceRest) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const priceRest = await page.evaluate((selectorPriceRest) => selectorPriceRest?.textContent, selectorPriceRest);

			const productTitle = title?.replace("'", "\\'")?.split("'");
			const productPrice = `${price},${priceRest} zł`;
			const shop = 'carrefours';

			const createCallback = () => addNewProduct(connection, shop, productTitle, productPrice);
			const updateCallback = (id) => updateProductPrice(connection, shop, id, productPrice);
			checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
		}
	};

	const getHomePage = async () => {
		await page.goto('https://www.carrefour.pl/artykuly-spozywcze');
		const itemsCounter = (await page.$$(`${rootSelector}`)).length;
		for (let i = 1; i <= itemsCounter; i++) await getPageData(i);
	};

	const getRestPages = async () => {
		for (let pageId = 1; pageId <= 75; pageId++) {
			console.log('PageID', pageId);
			await page.goto(`https://www.carrefour.pl/artykuly-spozywcze?page=${pageId}`);
			await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
			const itemsCounter = (await page.$$(`${rootSelector}`)).length;
			for (let i = 1; i <= itemsCounter; i++) await getPageData(i);
		}
	};

	const endConnection = async () => connection.end();

	await getHomePage();
	await getRestPages();
	await endConnection();
	await browser.close();
};
