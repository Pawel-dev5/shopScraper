import { launch } from 'puppeteer';
import { makroPages } from './pages.js';

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
		const onClick = await page.waitForSelector('a.mfcss_load-more-articles');
		const href = await page.evaluate((onClick) => onClick?.href, onClick);
		await page.tap(onClick, { waitUntil: 'networkidle0' });

		// await page.goto(href, { waitUntil: 'networkidle0' });
		await page.waitForNavigation({ waitUntil: 'load' });

		const test = await page.waitForSelector('a.mfcss_load-more-articles > p:nth-child(2) > span');
		const title = await page.evaluate((test) => test?.textContent, test);
		console.log('pageItems', title);
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

			const newObject = {
				title,
				price: `${price},${priceRest} zł`,
			};
			if (newObject) arr.push(newObject);
			// arr = [];
		}
	};

	const getMakroPages = async () => {
		for (let pageId = 0; pageId < makroPages?.length; pageId++) {
			console.log('PageID', makroPages[pageId]);
			// try {
			await page.goto(makroPages[pageId], { waitUntil: 'networkidle0' });
			// const selectorTitle = await page.waitForSelector('#main > div > div:last-child > div > div:nth-child(2)', timeout);
			// const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);

			// console.log('pageItems', selectorTitle);

			for (let i = 1; i < 61; i++) await getPageData(i);
			console.log(arr);
			// } catch (e) {}
		}
	};

	await getMakroPages();
	await browser.close();
};
