import { CarrefourProducts, BiedronkaProducts, MakroProducts } from './src/shops/index.js';

const scrapeShops = async () => {
	await CarrefourProducts();
	// await MakroProducts();
	// await scrapeCarrefourNewspaper();
	// await BiedronkaProducts();
};

scrapeShops();
