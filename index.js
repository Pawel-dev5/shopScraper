import {
	CarrefourProducts,
	BiedronkaProducts,
	MakroProducts,
	RossmanProducts,
	AuchanProducts,
	CarrefourExpressProducts,
} from './src/shops/index.js';

const scrapeShops = async () => {
	// await CarrefourProducts();
	// await RossmanProducts();
	// await BiedronkaProducts();
	await AuchanProducts();
	// await CarrefourExpressProducts();
	// await MakroProducts();
	// await scrapeCarrefourNewspaper();
};

scrapeShops();
