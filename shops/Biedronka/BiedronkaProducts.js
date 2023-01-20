import { launch } from 'puppeteer';
import { pagesToScrapGlovo } from './pagesToScrapGlovo.js';

export const BiedronkaProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();

	pagesToScrapGlovo.map(async (currentPage) => {
		try {
			await page.goto(currentPage);

			const urls = await page.evaluate(() => {
				const results = [];
				const items = document.querySelectorAll('[data-test-id="product-tile"]');
				items?.forEach((item) => {
					results.push({
						title: item?.children?.item(1)?.firstChild?.innerText,
						price: item?.children?.item(2)?.firstChild?.innerText,
						img: item?.firstChild?.children?.item(3)?.src,
					});
				});
				return results;
			});
			console.log(currentPage);
			console.log(urls);
			// return urls;
			await browser.close();
		} catch (e) {
			return null;
		}
	});
};
