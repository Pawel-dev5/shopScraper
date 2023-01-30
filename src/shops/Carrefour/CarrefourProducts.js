import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';
import { autoScroll } from '../../common/autoScroll.js';

// PAGES
import { allPages } from './pages.js';

const getElements = async ({ baseSelectors, connection, page, productCategory, timeout }) => {
	if (baseSelectors) {
		let selectorPrice;
		let selectorPriceRest;
		let selectorTitle;
		let selectorImage;

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

		const getTitle = () => page.waitForSelector(`${baseSelectors} > div.MuiBox-root > a`, timeout);
		const getImageUrl = () => page.waitForSelector(`${baseSelectors} > button.MuiButtonBase-root > div > img`, timeout);

		try {
			selectorTitle = await getTitle();
			selectorImage = await getImageUrl();
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

		if (selectorImage && selectorTitle && selectorPrice && selectorPriceRest) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const imageUrl = await page.evaluate((selectorImage) => selectorImage?.src, selectorImage);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const priceRest = await page.evaluate((selectorPriceRest) => selectorPriceRest?.textContent, selectorPriceRest);

			const productTitle = title?.replace("'", "\\'")?.trim();
			const productPrice = `${price},${priceRest} zł`;
			const shop = 'carrefours';

			// const createCallback = () => console.log('create', productTitle, productPrice, productCategory);
			const createCallback = () =>
				addNewProduct({ connection, shop, productTitle, productPrice, productCategory, imageUrl });

			// const updateCallback = (id) => console.log('update', id, productTitle, productPrice);
			const updateCallback = (id) => updateProductPrice(connection, shop, id, productPrice);
			checkIsExist(connection, shop, productTitle, createCallback, updateCallback);
		} else {
			console.log('ERROR! BRAK SELECTORA', itemId, selectorTitle, selectorImage);
		}
	}
};

export const CarrefourProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const timeout = { timeout: 200 };
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});

	const rootSelector = (index) =>
		`div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(${index}) > div > div > div`;

	const getProducts = async (itemId, productCategory) => {
		let baseSelectors;

		try {
			baseSelectors = `${rootSelector(4)}:nth-child(${itemId}) > div`;
			await getElements({ baseSelectors, connection, page, productCategory, timeout });
		} catch (e) {
			try {
				baseSelectors = `${rootSelector(5)}:nth-child(${itemId}) > div`;
				await getElements({ baseSelectors, connection, page, productCategory, timeout });
			} catch (e) {
				console.log('ERROR! CANT GET BASE SELECTOR');
			}
		}
	};

	const getPages = async () => {
		if (allPages && allPages.length > 0) {
			for (let pageCount = 0; pageCount <= allPages?.length; pageCount++) {
				if (allPages[pageCount]) {
					const productCategory = allPages[pageCount]?.category;
					const urls = allPages[pageCount]?.urls;

					for (let urlCounter = 0; urlCounter < urls?.length; urlCounter++) {
						await page.goto(urls[urlCounter]);
						let selectorAllPages;

						const getCounter = (index) =>
							page.waitForSelector(
								`div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(${index}) > div > p`,
								timeout,
							);

						try {
							selectorAllPages = await getCounter(5);
						} catch (e) {
							try {
								selectorAllPages = await getCounter(6);
							} catch (e) {
								console.log('ERROR!', 'CANT FIND PAGES COUNTER ON PAGE:', urls[urlCounter]);
							}
						}

						const allPages = await page.evaluate((selectorAllPages) => selectorAllPages?.textContent, selectorAllPages);
						const allPagesCounter = Number(allPages?.slice(2)?.trim());
						console.log('AllPagesCounter:', allPagesCounter);

						for (let url = 0; url < allPagesCounter; url++) {
							let finalUrl = `${urls[urlCounter]}?page=${url}`;
							if (url === 0) finalUrl = urls[urlCounter];

							console.log('url:', finalUrl);
							await page.goto(finalUrl);
							await autoScroll(page);

							let itemsCounter;
							const geItemsCounter = (index) =>
								page.$$(
									`div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(${index}) > div > div > div`,
									timeout,
								);
							try {
								itemsCounter = await geItemsCounter(4);
							} catch (e) {
								try {
									itemsCounter = await geItemsCounter(5);
								} catch (e) {
									console.log('ERROR! CANT GET ALL ITEMS COUNT ON PAGE:', urls[urlCounter]);
								}
							}

							if (itemsCounter?.length === 0) {
								try {
									itemsCounter = await geItemsCounter(5);
								} catch (e) {
									console.log('ERROR! CANT GET ALL ITEMS COUNT ON PAGE:', urls[urlCounter]);
								}
							}

							if (itemsCounter) {
								console.log('items:', itemsCounter?.length);
								for (let i = 1; i <= itemsCounter?.length; i++) await getProducts(i, productCategory);
							}
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
