import { launch } from 'puppeteer';

export const scrapeCarrefourNewspaper = async () => {
	const browser = await launch({});
	const page = await browser.newPage();
	const timeout = { timeout: 10 };

	const getNewspaper = async () => {
		await page.goto('https://www.carrefour.pl/promocje/gazetka-promocyjna');
		const buttonSelector =
			'div.MuiBox-root > div.MuiBox-root > div:nth-child(5) > div:nth-child(2) > button.MuiButtonBase-root';
		// const titleSelectors =
		// 	'div.MuiBox-root > div.MuiBox-root > div:nth-child(5) > div:nth-child(2) > button.MuiButtonBase-root > div:nth-child(2) > h3.MuiTypography-root';
		// const productTitle = await page.waitForSelector(`${titleSelectors} `, timeout);
		// const title = await page.evaluate((productTitle) => productTitle?.textContent, productTitle);

		const downloadButtonSelector = 'div.MuiDialogContent-root';
		// const download = await page.waitForSelector(`${downloadButtonSelector} `, timeout);
		// const downloadTitle = await page.evaluate((download) => download?.href, download);
		// const render = async () => await page.waitForSelector(`${buttonSelector} `, timeout);
		await page.click(buttonSelector);

		// await render();
		// const getelements = async () => {
		// for (let pageId = 1; pageId < 5; pageId++) {
		// const download = await page.waitForSelector('body', { timeout, visible: false });
		// const tmp = await page.url('https://www.carrefour.pl/files/newspaper', (elm) => elm.class, timeout);
		// const href = await page.$eval('https://www.carrefour.pl/files/newspaper', (elm) => elm.href);

		// await console.log(download);

		// const newUrls = async () =>

		const checkRender = await page.evaluate(() => document.querySelector('[role="presentation"]'));
		if (checkRender) {
			const download = await page.waitForSelector('div.MuiDialog-root');
			// const tmp = await page.evaluate(() => document.querySelector('[role="presentation"]'));
			// console.log(tmp);
			// const title = await page.evaluate((download) => download?.style, download);

			console.log(download);
		}
		// await newUrls();
		// }
		// };
		// await getelements();
	};

	await getNewspaper();
	await browser.close();
};
