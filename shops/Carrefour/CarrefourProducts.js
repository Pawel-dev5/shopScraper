import { launch } from 'puppeteer';

export const CarrefourProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const timeout = { timeout: 10 };
	let arr = [];

	const getPageData = async (itemId) => {
		const baseSelectors = 'div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(5) > div > div';
		let selectorPrice;
		let selectorPriceRest;
		let selectorTitle;

		const getPrice = (index) =>
			page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)`,
				timeout,
			);
		const getPriceRest = (index) =>
			page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div:nth-child(${index}) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)`,
				timeout,
			);

		try {
			selectorTitle = await page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div.MuiBox-root > a.MuiButtonBase-root`,
				timeout,
			);
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

		if (selectorPrice && selectorTitle && selectorPriceRest) {
			const title = await page.evaluate((selectorTitle) => selectorTitle?.textContent, selectorTitle);
			const price = await page.evaluate((selectorPrice) => selectorPrice?.textContent, selectorPrice);
			const priceRest = await page.evaluate((selectorPriceRest) => selectorPriceRest?.textContent, selectorPriceRest);
			// console.log(title + ' ' + price + ',' + priceRest + 'zł');

			const newObject = {
				title,
				price: `${price},${priceRest} zł`,
			};
			if (newObject) arr.push(newObject);
			// arr = [];
		}
	};

	const getHomePage = async () => {
		await page.goto('https://www.carrefour.pl/artykuly-spozywcze');
		for (let i = 1; i < 61; i++) await getPageData(i);
		console.log(arr);
	};

	const getRestPages = async () => {
		for (let pageId = 1; pageId < 76; pageId++) {
			console.log('PageID', pageId);
			await page.goto(`https://www.carrefour.pl/artykuly-spozywcze?page=${pageId}`);
			for (let i = 1; i < 61; i++) await getPageData(i);
			console.log(arr);
		}
	};

	await getHomePage();
	await getRestPages();
	await browser.close();
};
