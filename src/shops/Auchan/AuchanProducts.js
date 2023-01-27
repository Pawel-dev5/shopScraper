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
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});

	const getPages = async () => {
		const getPageData = async (itemId) => {
			const baseSelectors = `div._2XHV > div > div > div:nth-child(${itemId})`;
			await page.waitForSelector(baseSelectors);
			let selectorElement;

			const getTitle = () => page.waitForSelector(`${baseSelectors} > div`);

			try {
				selectorElement = await getTitle();
			} catch (e) {
				console.log('error get auchan page data', itemId);
			}

			if (selectorElement) {
				const title = await page.evaluate((selectorElement) => selectorElement?.textContent, selectorElement);
				const shop = 'auchans';
				const element = title.split(/\r\n|\r|\n/);

				if (element && element[0] && element[1]) {
					const productTitle = element[0].trim().replace('- - ) ', '').replace('- - )', '').replace('- - ', '');
					const productPrice = element[1].trim();

					if (productTitle !== '') {
						// const createCallback = () => console.log('create', productTitle);
						const createCallback = async () => addNewProduct({ connection, shop, productTitle, productPrice });

						// const updateCallback = (id) => console.log('update', productTitle);
						const updateCallback = async (id) => updateProductPrice(connection, shop, id, productPrice);

						checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
					}
				}
			}
		};

		if (allPages && allPages?.length > 0) {
			for (let pageId = 0; pageId <= allPages?.length; pageId++) {
				if (allPages[pageId]) {
					console.log(allPages[pageId]);
					await page.goto(allPages[pageId]);

					const scrollToLoadAllItems = async () => {
						try {
							const scrollable_section = 'footer';
							await page.waitForSelector('footer');
							await page.waitForSelector('div._2xr_');

							const counter = await page.waitForSelector(`div._2xr_`);
							const title = await page.evaluate((counter) => counter?.textContent, counter);

							let loadedItems = title?.trim().slice(11, 14);
							let allItems = title.trim().slice(28);

							const scrollCounter = allItems / 15;

							for (let i = 1; i <= scrollCounter; i++) {
								const counter = await page.waitForSelector('div._2xr_');
								const newTitle = await page.evaluate((counter) => counter?.textContent, counter);
								loadedItems = newTitle?.trim().slice(11, 14);
								allItems = newTitle.trim().slice(28);
								console.log(loadedItems);
								console.log(allItems);
								console.log(allItems === loadedItems);

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

								await page.waitForTimeout(5000);
							}
						} catch (e) {
							console.log('error scrolla');
						}
					};

					const checkFinalCounter = async () => {
						try {
							const counter = await page.waitForSelector(`div._2xr_`);
							const title = await page.evaluate((counter) => counter?.textContent, counter);
							console.log(title.trim());

							if (title) {
								const loadedItems = title?.trim().slice(11, 14);
								const allItems = title.trim().slice(28);
								console.log('loadedItems', loadedItems);
								console.log('allItems', allItems);

								const allItemsLoaded = loadedItems.trim() === allItems.trim();
								console.log('allitemsloaded?', allItemsLoaded);
							}
						} catch (e) {}
					};

					const scrapPage = async () => {
						const itemsCounter = (await page.$$('div._2ulq._1hug._1K_g._1OR2._24YF.LRoH._2F53._48TB')).length;
						console.log(itemsCounter);
						if (itemsCounter) {
							for (let i = 1; i <= itemsCounter; i++) await getPageData(i);
						}
					};

					await scrollToLoadAllItems();
					// await checkFinalCounter();
					await scrapPage();
				}
			}
		}
	};

	const endConnection = async () => connection.end();

	await getPages();
	// await endConnection();
	// await browser.close();
};
