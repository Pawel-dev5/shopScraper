import { launch } from 'puppeteer';

export const scrapeCarrefourProducts = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const timeout = { timeout: 10 };

	const getPageData = async (itemId) => {
		const baseSelectors = 'div.MuiBox-root > div.MuiBox-root > div:nth-child(2) > div > div:nth-child(5) > div > div';
		let productPrice;
		let productPriceRest;
		let productTitle;

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
			productTitle = await page.waitForSelector(
				`${baseSelectors} > div:nth-child(${itemId}) > div > div.MuiBox-root > a.MuiButtonBase-root`,
				timeout,
			);
			productPrice = await getPrice(4);
			productPriceRest = await getPriceRest(4);
		} catch (e) {
			try {
				productPrice = await getPrice(3);
				productPriceRest = await getPriceRest(3);
			} catch (e) {
				try {
					productPrice = await getPrice(5);
					productPriceRest = await getPriceRest(5);
				} catch (e) {
					try {
						productPrice = await getPrice(6);
						productPriceRest = await getPriceRest(6);
					} catch (e) {
						// console.log(e);
					}
				}
			}
		}

		if (productPrice && productTitle && productPriceRest) {
			const title = await page.evaluate((productTitle) => productTitle?.textContent, productTitle);
			const price = await page.evaluate((productPrice) => productPrice?.textContent, productPrice);
			const priceRest = await page.evaluate((productPriceRest) => productPriceRest?.textContent, productPriceRest);
			console.log(title + ' ' + price + ',' + priceRest + 'zł');
		}
	};

	const getHomePage = async () => {
		await page.goto('https://www.carrefour.pl/artykuly-spozywcze');
		for (let i = 1; i < 61; i++) await getPageData(i);
	};

	const getRestPages = async () => {
		for (let pageId = 1; pageId < 76; pageId++) {
			console.log('PageID', pageId);
			await page.goto(`https://www.carrefour.pl/artykuly-spozywcze?page=${pageId}`);
			for (let i = 1; i < 61; i++) await getPageData(i);
		}
	};

	await getHomePage();
	await getRestPages();
	await browser.close();
};
