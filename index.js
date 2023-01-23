import { CarrefourProducts, BiedronkaProducts, MakroProducts, RossmanProducts, BiedraProducts } from './src/shops/index.js';

const scrapeShops = async () => {
	// await CarrefourProducts();
	// await RossmanProducts();
	await BiedraProducts();

	// await MakroProducts();
	// await BiedronkaProducts();
	// await scrapeCarrefourNewspaper();
};

scrapeShops();
