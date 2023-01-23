import { getRandomInt } from '../helpers/randomValues.js';

const randomRange = [100000, 429496729];

const createProductPrice = ({ connection, shop, priceID, currentDate, productPrice, connectionID, productID }) => {
	// CREATE PRODUCT PRICE
	const sqlCreatePrice = `INSERT INTO components_products_prices(id,date,price)
		VALUES("${priceID}",'${currentDate}','${productPrice}')`;
	// connection.query(sqlCreatePrice);
	connection.query(sqlCreatePrice, (error) => {
		if (error) return console.log('createPriceQueryError', error);
	});

	// CREATE PRODUCT PRICE CONNECTIONS
	const sqlCreateProductPriceRelation = `INSERT INTO ${shop}_components(id,entity_id,component_id,component_type,field)
		VALUES("${connectionID}","${productID}","${priceID}","products.price","prices")`;
	connection.query(sqlCreateProductPriceRelation, (error) => {
		if (error) return console.log('createProdPriceConnectQueryError', error);
	});
};

const createProduct = ({
	connection,
	shop,
	productID,
	productTitle,
	currentDate,
	priceID,
	connectionID,
	productPrice,
	imageUrl,
	productDescription,
}) => {
	// CREATE PRODUCT ITEM
	let sqlCreateProduct;

	sqlCreateProduct = `INSERT INTO ${shop}(id,title,created_by_id, updated_by_id,image_url,created_at,updated_at)
	VALUES("${productID}",'${productTitle}',1,1,"${imageUrl}","${currentDate}","${currentDate}")`;

	if (productDescription) {
		sqlCreateProduct = `INSERT INTO ${shop}(id,title,created_by_id, updated_by_id,image_url,created_at,updated_at${
			productDescription && ',description'
		})
		VALUES("${productID}",'${productTitle}',1,1,"${imageUrl}","${currentDate}","${currentDate}"${
			productDescription && `,"${productDescription}"`
		})`;
	}

	connection.query(sqlCreateProduct, (error) => {
		if (error) return console.log('createProductQueryError', error);
	});

	// CREATE PRICE AND RELATIONS
	createProductPrice({ connection, shop, priceID, currentDate, productPrice, connectionID, productID });

	console.log('create', productTitle);
};

export const addNewProduct = ({ connection, shop, productTitle, productPrice, imageUrl, productDescription }) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const productID = getRandomInt(randomRange[0], randomRange[1]);
	const priceID = getRandomInt(randomRange[0], randomRange[1]);
	const connectionID = getRandomInt(randomRange[0], randomRange[1]);

	let checkID = `SELECT * FROM ${shop} WHERE id = "${productID}"`;

	connection.query(checkID, (error, results) => {
		if (error) return console.error('checkIDError', productTitle, error.message);

		const basicProps = {
			connection,
			productTitle,
			currentDate,
			priceID,
			connectionID,
			productPrice,
			shop,
			imageUrl,
			productDescription,
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
	console.log('update', productID, productPrice);
};

export const checkIsExist = (connection, shop, productTitle, createCallback, updateCallback, description) => {
	let sql = `SELECT * FROM ${shop} WHERE title = "${productTitle}"`;
	if (description) {
		sql = `SELECT * FROM ${shop} WHERE title = "${productTitle}" AND description = "${description}"`;
	}
	connection.query(sql, (error, results) => {
		if (error) return console.error('checkIsExistProd', error?.message);
		if (results?.length === 0) createCallback();
		if (results?.length > 0) updateCallback(results[0]?.id);
	});
};
