// import { launch } from 'puppeteer';
// import { allPages, makroPages } from './pages.js';

// export const MakroProducts = async () => {
// 	const browser = await launch({});
// 	const page = await browser.newPage();
// 	const timeout = { timeout: 10 };
// 	let arr = [];

// 	const getPageData = async (itemId) => {
// 		let selectorPrice;
// 		let selectorPriceRest;
// 		let selectorTitle;

// 		const getPrice = (index) =>
// 			page.waitForSelector(
// 				`div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)`,
// 				timeout,
// 			);
// 		const getPriceRest = (index) =>
// 			page.waitForSelector(
// 				`div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)`,
// 				timeout,
// 			);

// 		// try {

// 		// const test = await page.waitForSelector('a.mfcss_load-more-articles > p:nth-child(2) > span');
// 		// const title = await page.evaluate((test) => test?.textContent, test);
// 		// console.log('pageItems', title);
// 		// console.log('href', href);

// 		// selectorTitle = await page.waitForSelector(`div:nth-child(${itemId}) > div.mfcss_card-article-2--title`, timeout);
// 		// selectorPrice = await getPrice(4);
// 		// selectorPriceRest = await getPriceRest(4);
// 		// } catch (e) {
// 		// 	console.log('błąd');
// 		// }

// 		if (selectorPrice && selectorTitle && selectorPriceRest) {
// 			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
// 			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
// 			const priceRest = await page.evaluate((selectorPriceRest) => selectorPriceRest?.textContent, selectorPriceRest);
// 			console.log(title + ' ' + price + ',' + priceRest + 'zł');

// 			// const newObject = {
// 			// 	title,
// 			// 	price: `${price},${priceRest} zł`,
// 			// };
// 			// if (newObject) arr.push(newObject);
// 			// arr = [];
// 		}
// 	};

// 	const getMakroPages = async () => {
// 		for (let pageId = 0; pageId < makroPages?.length; pageId++) {
// 			console.log('PageID', makroPages[pageId]);
// 			await page.goto(makroPages[pageId]);

// 			const scrollToLoadAllItems = async () => {
// 				try {
// 					const counter = await page.waitForSelector(
// 						'div.body > div:nth-child(2) > div:nth-child(4) > div > div > div > a > p:nth-child(2)',
// 					);
// 					const title = await page.evaluate((counter) => counter?.textContent, counter);
// 					const allItems = title?.trim()?.slice(23, 27);
// 					const loadClickCounter = allItems / 24;

// 					for (let i = 1; i <= loadClickCounter; i++) {
// 						const targetElement = await page.waitForSelector(
// 							'div.body > div:nth-child(2) > div:nth-child(4) > div > div > div',
// 						);
// 						await targetElement.click();
// 						await page.waitForTimeout(5000);
// 						const itemsCounter = (await page.$$('div.body > div:nth-child(2) > div:nth-child(3) > span'))?.length;
// 						console.log('loadedItems:', itemsCounter);
// 					}
// 				} catch (e) {
// 					console.log('ERROR! SCROLLA');
// 				}
// 			};

// 			// console.log('pageItems', selectorTitle);
// 			const scrapPage = async () => {
// 				// for (let i = 1; i < 61; i++) await getPageData(i);
// 			};

// 			await scrollToLoadAllItems();
// 		}
// 	};

// 	// const endConnection = async () => connection.end();

// 	await getMakroPages();
// 	// await browser.close();
// };

import { launch } from 'puppeteer';
import { allPages } from './pages.js';

export const MakroProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const timeout = { timeout: 10 };
	let arr = [];

	const getPageData = async (itemId) => {
		let selectorPrice;
		let selectorPriceRest;
		let selectorTitle;

		const getPrice = (index) =>
			page.waitForSelector(
				`div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)`,
				timeout,
			);
		const getPriceRest = (index) =>
			page.waitForSelector(
				`div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)`,
				timeout,
			);

		// try {

		// const test = await page.waitForSelector('a.mfcss_load-more-articles > p:nth-child(2) > span');
		// const title = await page.evaluate((test) => test?.textContent, test);
		// console.log('pageItems', title);
		// console.log('href', href);

		// selectorTitle = await page.waitForSelector(`div:nth-child(${itemId}) > div.mfcss_card-article-2--title`, timeout);
		// selectorPrice = await getPrice(4);
		// selectorPriceRest = await getPriceRest(4);
		// } catch (e) {
		// 	console.log('błąd');
		// }

		if (selectorPrice && selectorTitle && selectorPriceRest) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const priceRest = await page.evaluate((selectorPriceRest) => selectorPriceRest?.textContent, selectorPriceRest);
			console.log(title + ' ' + price + ',' + priceRest + 'zł');

			// const newObject = {
			// 	title,
			// 	price: `${price},${priceRest} zł`,
			// };
			// if (newObject) arr.push(newObject);
			// arr = [];
		}
	};

	const getMakroPages = async () => {
		if (allPages && allPages?.length > 0) {
			for (let pageCount = 0; pageCount <= allPages?.length; pageCount++) {
				if (allPages[pageCount]) {
					const productCategory = allPages[pageCount]?.category;
					const urls = allPages[pageCount]?.urls;

					for (let urlCounter = 0; urlCounter <= urls?.length; urlCounter++) {
						if (urls[urlCounter]) {
							console.log('PageID', urls[urlCounter]);
							await page.goto(urls[urlCounter]);
							await page.waitForSelector('div.body > div:nth-child(2) > div:nth-child(4) > div > div > div');

							const scrollToLoadAllItems = async () => {
								try {
									const counter = await page.waitForSelector(
										'div.body > div:nth-child(2) > div:nth-child(4) > div > div > div > a > p:nth-child(2)',
									);
									const title = await page.evaluate((counter) => counter?.textContent, counter);
									const allItems = title?.trim()?.slice(23, 27);
									const loadClickCounter = Math.ceil(allItems / 24);
									console.log(title, loadClickCounter);

									for (let i = 1; i <= loadClickCounter; i++) {
										const targetElement = await page.waitForSelector(
											'div.body > div:nth-child(2) > div:nth-child(4) > div > div > div',
										);
										// console.log(targetElement);
										await targetElement.click();
										await page.waitForTimeout(5000);
										const itemsCounter = (await page.$$('div.body > div:nth-child(2) > div:nth-child(3) > span'))?.length;
										console.log('loadedItems:', itemsCounter);
									}
								} catch (e) {
									console.log('ERROR! SCROLLA');
								}
							};

							// console.log('pageItems', selectorTitle);
							const scrapPage = async () => {
								// for (let i = 1; i < 61; i++) await getPageData(i, productCategory);
							};

							await scrollToLoadAllItems();
						}
					}
				}
			}
		}

		// for (let pageId = 0; pageId < allPages?.length; pageId++) {

		// }
	};

	// const endConnection = async () => connection.end();

	await getMakroPages();
	// await browser.close();
};
