import { scrapeCarrefourProducts, scrapeCarrefourNewspaper } from './shops/Carrefour/index.js';

const scrapeShops = async () => {
	await scrapeCarrefourProducts();
	// await scrapeCarrefourNewspaper();
};

scrapeShops();
