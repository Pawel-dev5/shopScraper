import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

// PAGES
import { allPages } from './pages.js';

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

	const getPageData = async (itemId, productCategory) => {
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

			const createCallback = () => addNewProduct({ connection, shop, productTitle, productPrice, productCategory });
			const updateCallback = (id) => updateProductPrice(connection, shop, id, productPrice);
			checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
		}
	};

	const getPages = async () => {
		if (allPages && allPages.length > 0) {
			for (let pageCount = 0; pageCount <= allPages?.length; pageCount++) {
				if (allPages[pageCount]) {
					// try {
					const productCategory = allPages[pageCount]?.category;
					const urls = allPages[pageCount]?.urls;
					console.log(urls);

					for (let urlCounter = 0; urlCounter < urls?.length; urlCounter++) {
						await page.goto(urls[urlCounter]);
						const selectorAllPages = await page.waitForSelector(
							'div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(5) > div > p',
						);
						const allPages = await page.evaluate((selectorAllPages) => selectorAllPages?.textContent, selectorAllPages);
						const allPagesCounter = Number(allPages?.slice(2)?.trim());

						console.log(allPagesCounter);
						const getRestPages = async () => {
							for (let url = 1; url < allPagesCounter; url++) {
								console.log('url:', url);
								await page.goto(`${urls[urlCounter]}?page=${url}`);
								await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
								const itemsCounter = (
									await page.$$(
										'div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(4) > div > div > div',
									)
								).length;
								console.log('items:', itemsCounter);
								// for (let i = 1; i <= itemsCounter; i++) await getPageData(i, productCategory);
							}
						};

						// await getRestPages();
					}
					// } catch (e) {
					// 	console.log('PageError!', allPages[pageCount]);
					// }
				}
			}
		}
	};

	const endConnection = async () => connection.end();

	await getPages();
	// await endConnection();
	await browser.close();
};
