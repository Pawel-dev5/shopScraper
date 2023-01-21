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

	const getPageData = async (itemId) => {
		const baseSelectors = 'div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(5) > div > div';
		let selectorPrice;
		let selectorPriceRest;
		let selectorTitle;

		const getPrice = (index) =>
			page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)`,
				timeout,
			);
		const getPriceRest = (index) =>
			page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)`,
				timeout,
			);

		try {
			selectorTitle = await page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div.MuiBox-root > a.MuiButtonBase-root`,
				timeout,
			);
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
			console.log(productTitle + ' ' + price + ',' + priceRest + 'zł');
			const shop = 'carrefours';

			const createCallback = () => {
				console.log('create');
				addNewProduct(connection, shop, productTitle, productPrice);
			};
			const updateCallback = (id) => updateProductPrice(connection, shop, id, productPrice);
			checkIsExist(connection, shop, productTitle, createCallback, updateCallback);

			// DELETE statment
			// let sqlDelete = `DELETE FROM carrefours WHERE title = "Pomidor"`;
			// let sqlDeletePrice = `DELETE FROM components_products_prices WHERE id = "4294967295"`;
			// let sqlDeleteConnection = `DELETE FROM carrefours_components WHERE id = "4294967295"`;
			// connection.query(sqlDelete, 1, (error, results) => {
			// 	if (error) return console.error(error.message);

			// 	console.log('Deleted Row(s):', results.affectedRows);
			// });

			// connection.end();
		}
	};

	const getHomePage = async () => {
		await page.goto('https://www.carrefour.pl/artykuly-spozywcze');
		for (let i = 1; i < 61; i++) await getPageData(i);
	};

	const getRestPages = async () => {
		for (let pageId = 1; pageId < 76; pageId++) {
			console.log('PageID', pageId);
			await page.goto(`https://www.carrefour.pl/artykuly-spozywcze?page=${pageId}`);
			for (let i = 1; i < 61; i++) await getPageData(i);
		}
	};

	await getHomePage();
	await getRestPages();
	await connection.end();
	await browser.close();
};
