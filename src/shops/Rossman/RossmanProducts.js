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

	const getPageData = async (itemId) => {
		const baseSelectors = `div.product-list > div:nth-child(${itemId}) > div`;
		let selectorPrice;
		let selectorTitle;
		let selectorImageUrl;
		let selectorDescription;

		const getPrice = (index) => page.waitForSelector(`${baseSelectors} > div:nth-child(${index}) > span`);
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

		if (selectorPrice && selectorTitle && selectorDescription) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const imageUrl = await page.evaluate((selectorImageUrl) => selectorImageUrl?.src, selectorImageUrl);
			const description = await page.evaluate(
				(selectorDescription) => selectorDescription?.textContent,
				selectorDescription,
			);

			const productTitle = title?.replace("'", "\\'");
			const shop = 'rossmans';

			const createCallback = () =>
				addNewProduct({ connection, shop, productTitle, productPrice: price, imageUrl, productDescription: description });
			const updateCallback = (id) => updateProductPrice(connection, shop, id, price);
			checkIsExist(connection, shop, productTitle, createCallback, updateCallback, description);
		}
	};

	const endConnection = async () => connection.end();
	const getPages = async () => {
		const scrap = async ({ pageMax, url }) => {
			for (let pageId = 1; pageId <= pageMax; pageId++) {
				console.log('PageID', pageId);
				await page.goto(`https://www.rossmann.pl/kategoria/${url}?Page=${pageId}&PageSize=96`);
				await page.evaluate((_) => window.scrollBy(0, window.innerHeight));
				const itemsCounter = (await page.$$('div.product-list > div')).length;
				for (let i = 1; i <= itemsCounter; i++) await getPageData(i);
			}
		};
		await scrap({ pageMax: 27, url: 'twarz,8686' });
		await scrap({ pageMax: 65, url: 'makijaz,8528' });
		await scrap({ pageMax: 21, url: 'wlosy,8655' });
		await scrap({ pageMax: 11, url: 'cialo,8625' });
		await scrap({ pageMax: 27, url: 'higiena,8576' });
		await scrap({ pageMax: 14, url: 'perfumy,8512' });
		await scrap({ pageMax: 19, url: 'mama-i-dziecko,8471' });
		await scrap({ pageMax: 15, url: 'mezczyzna,9246' });
		await scrap({ pageMax: 23, url: 'zywnosc,8405' });
		await scrap({ pageMax: 3, url: 'akcje-specjalne,9598' });
		await scrap({ pageMax: 9, url: 'czystosc-w-domu,8323' });
		await scrap({ pageMax: 10, url: 'zdrowie,8445' });
		await scrap({ pageMax: 14, url: 'wyposazenie-domu,8303' });
		await scrap({ pageMax: 4, url: 'zwierzeta,8372' });
	};

	await getPages();
	await endConnection();
	await browser.close();
};
