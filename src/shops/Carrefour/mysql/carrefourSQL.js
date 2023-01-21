import dotenv from 'dotenv';
import { getRandomInt } from '../../../helpers/randomValues.js';

dotenv.config();

export const connectSqlConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};

const createProductPrice = ({ connection, priceID, currentDate, productPrice, connectionID, productID }) => {
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
	const sqlCreateProductPriceRelation = `INSERT INTO carrefours_components(id,entity_id,component_id,component_type,field)
		VALUES("${connectionID}","${productID}","${priceID}","products.price","prices")`;
	connection.query(sqlCreateProductPriceRelation);
};

const createProduct = ({ connection, productID, productTitle, currentDate, priceID, connectionID, productPrice }) => {
	// CREATE PRODUCT ITEM
	const sqlCreateProduct = `INSERT INTO carrefours(id,title,created_by_id, updated_by_id,image_url,created_at,updated_at)
		VALUES("${productID}",'${productTitle}',1,1,null,"${currentDate}","${currentDate}")`;
	connection.query(sqlCreateProduct);

	// CREATE PRICE AND RELATIONS
	createProductPrice({ connection, priceID, currentDate, productPrice, connectionID, productID });
};

export const addNewCarrefourProduct = (connection, productTitle, productPrice) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const productID = getRandomInt(100000, 429496729);
	const priceID = getRandomInt(100000, 429496729);
	const connectionID = getRandomInt(100000, 429496729);

	let checkID = `SELECT * FROM carrefours WHERE id = "${productID}"`;

	connection.query(checkID, (error, results) => {
		if (error) return console.error(error.message);

		const basicProps = {
			connection,
			productTitle,
			currentDate,
			priceID,
			connectionID,
			productPrice,
		};
		if (results.length > 0) {
			const newProductID = getRandomInt(100000, 429496729);
			createProduct({ ...basicProps, newProductID });
		} else createProduct({ ...basicProps, productID });

		connection.end();
	});
};

export const updateCarrefourProduct = (connection, productID, productPrice) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const priceID = getRandomInt(100000, 429496729);
	const connectionID = getRandomInt(100000, 429496729);

	// CREATE PRICE AND RELATIONS
	createProductPrice({ connection, priceID, currentDate, productPrice, connectionID, productID });

	connection.end();
};

export const checkIsExist = (connection, productTitle, createCallback, updateCallback) => {
	const sql = `SELECT * FROM carrefours WHERE title = "${productTitle}"`;

	connection.query(sql, (error, results) => {
		if (error) return console.error(error.message);
		if (results.length === 0) createCallback();
		if (results.length !== 0) updateCallback(results[0]?.id);
	});
};
