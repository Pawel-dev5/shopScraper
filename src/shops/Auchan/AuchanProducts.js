import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';
import { allPages } from './pages.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

export const AuchanProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	// const connection = mysql.createConnection(connectSqlConfig);
	// connection.connect(function (err) {
	// 	if (err) return console.error('error: ' + err.message);
	// 	console.log('Connected to the MySQL server.');
	// });

	const rootSelector = (gridNumber) =>
		`div.store__body__dynamic-content > div:nth-child(${gridNumber}) > div.grid__content > section`;

	// const getPageData = async (itemId, gridNumber) => {
	// 	const baseSelectors = `${rootSelector(gridNumber)}:nth-child(${itemId}) > div`;
	// 	let selectorPrice;
	// 	let selectorTitle;
	// 	let selectorImageUrl;

	// 	const getPrice = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > div > span`);
	// 	const getTitle = () => page.waitForSelector(`${baseSelectors} > span > span`);
	// 	const getImageUrl = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > img`);

	// 	try {
	// 		selectorPrice = await getPrice(3);
	// 		selectorTitle = await getTitle();
	// 		selectorImageUrl = await getImageUrl(1);
	// 	} catch (e) {
	// 		console.log('error get biedra page data', itemId);
	// 	}

	// 	if (selectorPrice && selectorTitle && selectorImageUrl) {
	// 		const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
	// 		const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
	// 		const url = await page.evaluate((selectorImageUrl) => selectorImageUrl?.src, selectorImageUrl);

	// 		const productTitle = title?.trim();
	// 		const productPrice = price?.trim();
	// 		const imageUrl = url.trim();
	// 		const shop = 'auchans';

	// 		// const createCallback = () => console.log('create', productTitle, productPrice);
	// 		const createCallback = async () => addNewProduct({ connection, shop, productTitle, productPrice, imageUrl });

	// 		// const updateCallback = (id) => console.log('update', productTitle, productPrice);
	// 		const updateCallback = async (id) => updateProductPrice(connection, shop, id, productPrice);

	// 		checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
	// 	}
	// };

	const getPages = async () => {
		if (allPages && allPages?.length > 0) {
			for (let pageId = 0; pageId <= allPages?.length; pageId++) {
				if (allPages[pageId]) {
					await page.goto(allPages[pageId]);
					// await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
					// await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
					// const gridCounter = (await page.$$(`div._33_Y`))?.length;
					// const allItemsCount = await page.$$(
					// 	`main > #container > div:last-child > div:last-child > div > div > div:nth-child(5) > div > div:first-child > div > *`,
					// );
					const gridCounterLength = await page.$$(`div._2ulq._1hug._1K_g._1OR2._24YF.LRoH._2F53._48TB`);

					page.evaluate(() => {
						const results = [];
						const items = document.querySelectorAll('div._2ulq._1hug._1K_g._1OR2._24YF.LRoH._2F53._48TB');
						console.log('items', items);
					});

					const scrollToLoadAllItems = async () => {
						const scrollable_section = 'footer';
						await page.waitForSelector('footer');
						await page.waitForSelector('div._2xr_');

						const counter = await page.waitForSelector(`div._2xr_`);
						const title = await page.evaluate((counter) => counter?.textContent, counter);

						let loadedItems = title?.trim().slice(11, 14);
						let allItems = title.trim().slice(28);

						while (loadedItems.trim() < allItems.trim()) {
							const counter = await page.waitForSelector(`div._2xr_`);
							const newTitle = await page.evaluate((counter) => counter?.textContent, counter);
							loadedItems = newTitle?.trim().slice(11, 14);
							allItems = newTitle.trim().slice(28);

							await page.evaluate((selector) => {
								const scrollableSection = document.querySelector(selector);

								scrollableSection.scrollTop = scrollableSection.offsetHeight;
							}, scrollable_section);

							await page.evaluate(() => {
								document.querySelector('footer').scrollIntoView();
							});
							await page.evaluate(() => {
								document.querySelector('div._2xr_').scrollIntoView(false);
							});

							await page.waitForTimeout(3000);
						}
					};

					const tmp = async () => {
						try {
							const counter = await page.waitForSelector(`div._2xr_`);
							const title = await page.evaluate((counter) => counter?.textContent, counter);
							console.log(title);

							if (title) {
								const loadedItems = title?.trim().slice(11, 14);
								const allItems = title.trim().slice(28);
								console.log('loadedItems', loadedItems);
								console.log('allItems', allItems);

								const allItemsLoaded = loadedItems.trim() === allItems.trim();
								console.log('allitemsloaded?', allItemsLoaded);
							}
						} catch (e) {
							console.log('WORKING!');
						}
					};

					await scrollToLoadAllItems();
					await tmp();
					// await countItems();
				}
			}
		}
	};

	// const endConnection = async () => connection.end();

	await getPages();
	// await endConnection();
	// await browser.close();
};
