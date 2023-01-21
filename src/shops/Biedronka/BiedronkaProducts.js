import { launch } from 'puppeteer';
import { pagesGlovo } from './pagesGlovo.js';
import mysql from 'mysql';

// COMMON
import { connectSqlConfig } from '../../common/mysql/sqlConfig.js';

export const BiedronkaProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const connection = mysql.createConnection(connectSqlConfig);
	connection.connect(function (err) {
		if (err) return console.error('error: ' + err.message);
		console.log('Connected to the MySQL server.');
	});

	pagesGlovo.map(async (currentPage) => {
		try {
			await page.goto(currentPage);

			const urls = () =>
				page.evaluate(() => {
					const results = [];
					const items = document.querySelectorAll('[data-test-id="product-tile"]');
					items?.map((item) => {
						const title = item?.children?.item(1)?.firstChild?.innerText;
						const price = item?.children?.item(2)?.firstChild?.innerText;
						const img = item?.firstChild?.children?.item(3)?.src;
						const shop = 'biedronkas';

						const createCallback = () => {
							console.log('create');
							addNewCarrefourProduct(connection, shop, title, price);
						};
						const updateCallback = (id) => updateCarrefourProduct(connection, shop, id, price);
						return checkIsExist(connection, shop, title, createCallback, updateCallback);

						// results.push({
						// 	title,
						// 	price,
						// 	img,
						// });
					});
					// return results;
				});
			// console.log(currentPage);
			// console.log(urls);
			await urls();
			// return urls;
			await browser.close();
		} catch (e) {
			console.log('error');
			return null;
		}
	});
};
