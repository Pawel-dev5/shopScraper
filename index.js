import { CarrefourProducts, BiedronkaProducts, MakroProducts, RossmanProducts, AuchanProducts } from './src/shops/index.js';

const scrapeShops = async () => {
	// await CarrefourProducts();
	// await RossmanProducts();
	// await BiedronkaProducts();
	await AuchanProducts();
	// await MakroProducts();
	// await scrapeCarrefourNewspaper();
};

scrapeShops();
