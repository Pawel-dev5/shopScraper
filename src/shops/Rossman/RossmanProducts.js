import { launch } from 'puppeteer';
import mysql from 'mysql';

// COMPONENTS
import { checkIsExist, addNewProduct, updateProductPrice } from '../../common/mysql/queriesSQL.js';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

export const RossmanProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});

	const getPageData = async (itemId, productCategory) => {
		const baseSelectors = `div.product-list > div:nth-child(${itemId}) > div`;
		let selectorPrice;
		let selectorPromotionPrice;
		let selectorPromotionPriceDescription;
		let selectorTitle;
		let selectorImageUrl;
		let selectorDescription;

		const getPrice = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > span:nth-child(1)`);
		const getPromotionPrice = (index) =>
			page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > span:nth-child(2)`, { timeout: 300 });
		const getPromotionPriceDescription = (index) =>
			page.waitForSelector(`${baseSelectors} > div:last-child > div`, { timeout: 300 });
		const getTitle = (index) => page.waitForSelector(`${baseSelectors} > a:nth-child(${index}) > strong`);
		const getDecsription = (index) => page.waitForSelector(`${baseSelectors} > a:nth-child(${index}) > span`);
		const getImageUrl = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > a > img`);

		try {
			selectorPrice = await getPrice(3);
			selectorTitle = await getTitle(2);
			selectorDescription = await getDecsription(2);
			selectorImageUrl = await getImageUrl(1);
		} catch (e) {
			console.log('error get rossman page data', itemId);
		}

		try {
			selectorPromotionPrice = await getPromotionPrice(3);
			selectorPromotionPriceDescription = await getPromotionPriceDescription(5);
		} catch (e) {
			selectorPromotionPrice = null;
			selectorPromotionPriceDescription = null;
		}

		if (selectorPrice && selectorTitle && selectorDescription) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const promotionPrice = await page.evaluate(
				(selectorPromotionPrice) => selectorPromotionPrice?.textContent,
				selectorPromotionPrice,
			);
			const promotionPriceDescription = await page.evaluate(
				(selectorPromotionPriceDescription) => selectorPromotionPriceDescription?.textContent,
				selectorPromotionPriceDescription,
			);
			const imageUrl = await page.evaluate((selectorImageUrl) => selectorImageUrl?.src, selectorImageUrl);
			const description = await page.evaluate(
				(selectorDescription) => selectorDescription?.textContent,
				selectorDescription,
			);

			const productTitle = title?.replace("'", "\\'");
			const productPromotionPrice = promotionPrice || null;
			const productPromotionDescription = promotionPriceDescription?.trim() || null;
			const shop = 'rossmans';

			// const createCallback = () =>
			// 	console.log(
			// 		'CREATE',
			// 		productTitle,
			// 		'PRICE:',
			// 		price,
			// 		'PROMOTION PRICE:',
			// 		productPromotionPrice,
			// 		productPromotionDescription,
			// 	);

			const createCallback = () =>
				addNewProduct({
					connection,
					shop,
					productTitle,
					productPrice: price,
					imageUrl,
					productDescription: description,
					productCategory,
					productPromotionPrice,
					productPromotionDescription,
				});

			// const updateCallback = (id) =>
			// 	console.log(
			// 		'UPDATE',
			// 		productTitle,
			// 		'PRICE:',
			// 		price,
			// 		'PROMOTION PRICE:',
			// 		productPromotionPrice,
			// 		productPromotionDescription,
			// 	);
			const updateCallback = (id) =>
				updateProductPrice(connection, shop, id, price, productPromotionPrice, productPromotionDescription);
			checkIsExist(connection, shop, productTitle, createCallback, updateCallback, description);
		}
	};

	const endConnection = async () => connection.end();
	const getPages = async () => {
		const scrap = async ({ pageMax, url, productCategory }) => {
			for (let pageId = 1; pageId <= pageMax; pageId++) {
				const currentUrl = `https://www.rossmann.pl/kategoria/${url}?Page=${pageId}&PageSize=96`;
				console.log('PageID', currentUrl);
				await page.goto(currentUrl);
				await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
				const itemsCounter = (await page.$$('div.product-list > div')).length;
				for (let i = 1; i <= itemsCounter; i++) await getPageData(i, productCategory);
			}
		};
		await scrap({ pageMax: 27, url: 'twarz,8686', productCategory: 'faceRossman' });
		await scrap({ pageMax: 65, url: 'makijaz,8528', productCategory: 'makeUpRossman' });
		await scrap({ pageMax: 21, url: 'wlosy,8655', productCategory: 'hairRossman' });
		await scrap({ pageMax: 11, url: 'cialo,8625', productCategory: 'bodyRossman' });
		await scrap({ pageMax: 27, url: 'higiena,8576', productCategory: 'cleanRossman' });
		await scrap({ pageMax: 14, url: 'perfumy,8512', productCategory: 'perfumeRossman' });
		await scrap({ pageMax: 19, url: 'mama-i-dziecko,8471', productCategory: 'babyRossman' });
		await scrap({ pageMax: 15, url: 'mezczyzna,9246', productCategory: 'manRossman' });
		await scrap({ pageMax: 23, url: 'zywnosc,8405', productCategory: 'foodRossman' });
		await scrap({ pageMax: 3, url: 'akcje-specjalne,9598', productCategory: 'specjalRossman' });
		await scrap({ pageMax: 9, url: 'czystosc-w-domu,8323', productCategory: 'homeCleanRossman' });
		await scrap({ pageMax: 10, url: 'zdrowie,8445', productCategory: 'healthRossman' });
		await scrap({ pageMax: 14, url: 'wyposazenie-domu,8303', productCategory: 'homeRossman' });
		await scrap({ pageMax: 4, url: 'zwierzeta,8372', productCategory: 'petsRossman' });
	};

	await getPages();
	await endConnection();
	await browser.close();
};
