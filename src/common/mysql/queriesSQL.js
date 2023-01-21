import { getRandomInt } from '../../helpers/randomValues.js';

const randomRange = [100000, 429496729];

const createProductPrice = ({ connection, shop, priceID, currentDate, productPrice, connectionID, productID }) => {
	// CREATE PRODUCT PRICE
	const sqlCreatePrice = `INSERT INTO components_products_prices(id,date,price)
		VALUES("${priceID}",'${currentDate}','${productPrice}')`;
	// connection.query(sqlCreatePrice);
	connection.query(sqlCreatePrice, function (err, results) {
		if (err) {
			console.log(err);
			return;
		}

		// do something with results
	});

	// CREATE PRODUCT PRICE CONNECTIONS
	const sqlCreateProductPriceRelation = `INSERT INTO ${shop}_components(id,entity_id,component_id,component_type,field)
		VALUES("${connectionID}","${productID}","${priceID}","products.price","prices")`;
	connection.query(sqlCreateProductPriceRelation);
};

const createProduct = ({ connection, shop, productID, productTitle, currentDate, priceID, connectionID, productPrice }) => {
	// CREATE PRODUCT ITEM
	const sqlCreateProduct = `INSERT INTO ${shop}(id,title,created_by_id, updated_by_id,image_url,created_at,updated_at)
		VALUES("${productID}",'${productTitle}',1,1,null,"${currentDate}","${currentDate}")`;
	connection.query(sqlCreateProduct);

	// CREATE PRICE AND RELATIONS
	createProductPrice({ connection, shop, priceID, currentDate, productPrice, connectionID, productID });
};

export const addNewProduct = (connection, shop, productTitle, productPrice) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const productID = getRandomInt(randomRange[0], randomRange[1]);
	const priceID = getRandomInt(randomRange[0], randomRange[1]);
	const connectionID = getRandomInt(randomRange[0], randomRange[1]);

	let checkID = `SELECT * FROM ${shop} WHERE id = "${productID}"`;

	connection.query(checkID, (error, results) => {
		if (error) return console.error(error.message);

		const basicProps = {
			connection,
			productTitle,
			currentDate,
			priceID,
			connectionID,
			productPrice,
			shop,
		};
		if (results.length > 0) {
			const newProductID = getRandomInt(100000, 429496729);
			createProduct({ ...basicProps, newProductID });
		} else createProduct({ ...basicProps, productID });
	});
};

export const updateProductPrice = (connection, shop, productID, productPrice) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const priceID = getRandomInt(randomRange[0], randomRange[1]);
	const connectionID = getRandomInt(randomRange[0], randomRange[1]);

	// CREATE PRICE AND RELATIONS
	createProductPrice({ connection, shop, priceID, currentDate, productPrice, connectionID, productID });
};

export const checkIsExist = (connection, shop, productTitle, createCallback, updateCallback) => {
	const sql = `SELECT * FROM ${shop} WHERE title = "${productTitle}"`;

	connection.query(sql, (error, results) => {
		if (error) return console.error(error.message);
		if (results.length === 0) createCallback();
		if (results.length !== 0) updateCallback(results[0]?.id);
	});
};
