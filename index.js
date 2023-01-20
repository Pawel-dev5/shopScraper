import { CarrefourProducts } from './shops/Carrefour/index.js';
import { BiedronkaProducts } from './shops/Biedronka/index.js';

const scrapeShops = async () => {
	await CarrefourProducts();
	// await scrapeCarrefourNewspaper();
	// await BiedronkaProducts();
};

scrapeShops();
