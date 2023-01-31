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
	const timeout = { timeout: 200 };

	const getPages = async () => {
		const getPageData = async (itemId, productCategory) => {
			const baseSelectors = `div._2XHV > div > div > div:nth-child(${itemId})`;
			await page.waitForSelector(baseSelectors);
			await page.focus(baseSelectors);
			await page.$eval(baseSelectors, (e) => e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' }));
			await page.waitForTimeout(1000);

			let selectorTitle;
			let selectorPrice;
			let selectorImage;

			const getTitle = () =>
				page.waitForSelector(`${baseSelectors} > div > div > div:nth-child(2) > div:nth-child(1) > a > span`, timeout);

			const getPrice = () =>
				page.waitForSelector(`${baseSelectors} > div > div > div:nth-child(3) > div:nth-child(1)`, timeout);

			const getImage = () =>
				page.waitForSelector(
					`${baseSelectors} > div > div > div:nth-child(1) > div > a > div > div:last-child > picture > source`,
					timeout,
				);

			try {
				selectorTitle = await getTitle();
				selectorPrice = await getPrice();
				selectorImage = await getImage();
			} catch (e) {
				console.log('ERROR! GET AUCHAN DATA ITEM ID:', itemId);
			}

			if (selectorTitle && selectorImage && selectorPrice) {
				const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
				const imageUrl = await page.evaluate((selectorImage) => selectorImage?.srcset, selectorImage);
				const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);

				const productTitle = title
					?.replace("'", "\\'")
					?.replace('- - ) ', '')
					?.replace('- - )', '')
					?.replace('- - ', '')
					?.replace('- ', '')
					?.replace('- - )>>', '')
					?.replace('- - /', '')
					?.trim();
				const productPrice = price?.trim();
				const shop = 'auchans';

				if (productPrice && productTitle && imageUrl) {
					// const createCallback = () => console.log('create', productTitle, productPrice);
					const createCallback = async () =>
						addNewProduct({ connection, shop, productTitle, productPrice, productCategory, imageUrl });

					// const updateCallback = (id) => console.log('update', id, productTitle);
					const updateCallback = async (id) => updateProductPrice(connection, shop, id, productPrice);

					checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
				}
			} else {
				console.log('ERROR! BRAK SELECTORA', itemId, selectorTitle, selectorImage);
			}
		};

		if (allPages && allPages?.length > 0) {
			for (let pageCount = 0; pageCount <= allPages?.length; pageCount++) {
				if (allPages[pageCount]) {
					const productCategory = allPages[pageCount]?.category;
					const urls = allPages[pageCount]?.urls;

					for (let urlCounter = 0; urlCounter <= urls?.length; urlCounter++) {
						if (urls[urlCounter]) {
							console.log(urls[urlCounter]);
							await page.goto(urls[urlCounter]);

							const scrollToLoadAllItems = async () => {
								try {
									const scrollable_section = 'footer';
									await page.waitForSelector('footer');
									await page.waitForSelector('div._2xr_');

									const counter = await page.waitForSelector(`div._2xr_`);
									const title = await page.evaluate((counter) => counter?.textContent, counter);

									let loadedItems = title?.trim()?.slice(11, 14);
									let allItems = title?.trim()?.slice(28);

									const scrollCounter = allItems / 15;

									for (let i = 1; i <= scrollCounter + 1; i++) {
										const counter = await page.waitForSelector('div._2xr_');
										const newTitle = await page.evaluate((counter) => counter?.textContent, counter);
										loadedItems = newTitle?.trim().slice(11, 14);
										allItems = newTitle.trim().slice(28);
										console.log('loadedItems', loadedItems);
										console.log('allItems', allItems);

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
									console.log('ERROR! SCROLLA');
								}
							};

							const checkFinalCounter = async () => {
								try {
									const counter = await page.waitForSelector(`div._2xr_`);
									const title = await page.evaluate((counter) => counter?.textContent, counter);

									if (title) {
										const loadedItems = title?.trim()?.slice(11, 14);
										const allItems = title?.trim()?.slice(28);
										console.log(title?.trim());
										console.log('loadedItems', loadedItems);
										console.log('allItems', allItems);
										console.log('allitemsloaded?', loadedItems?.trim() === allItems?.trim());
									}
								} catch (e) {}
							};

							const scrapPage = async () => {
								const itemsCounter = (await page.$$('div._2ulq._1hug._1K_g._1OR2._24YF.LRoH._2F53._48TB')).length;
								if (itemsCounter) {
									console.log(itemsCounter);
									for (let i = 1; i <= itemsCounter; i++) await getPageData(i, productCategory);
								}
							};

							await scrollToLoadAllItems();
							// await checkFinalCounter();
							await scrapPage();
						}
					}
				}
			}
		}
	};

	const endConnection = async () => connection.end();

	await getPages();
	// await endConnection();
	await browser.close();
};
