import { getRandomInt } from '../helpers/randomValues.js';

const randomRange = [10, 429496729];

const createRelation = ({ connection, shop, priceID, connectionID, productID }) => {
	// CREATE PRODUCT PRICE CONNECTIONS
	const sqlCreateProductPriceRelation = `INSERT INTO ${shop}_components(id,entity_id,component_id,component_type,field)
			VALUES("${connectionID}","${productID}","${priceID}","products.price","prices")`;
	if (productID && priceID && connectionID && connection) {
		connection.query(sqlCreateProductPriceRelation, (error) => {
			if (error)
				return console.log('RELATION ERROR!', 'ProdID:', productID, 'PriceID:', priceID, 'ConnectID:', connectionID);
		});
	} else console.log('RELATION ERROR!', 'ProdID:', productID, 'PriceID:', priceID, 'ConnectID:', connectionID);
};

const createProductPrice = ({
	connection,
	shop,
	priceID,
	currentDate,
	productPrice,
	connectionID,
	productID,
	productPromotionPrice,
	productPromotionDescription,
}) => {
	// CREATE PRODUCT PRICE
	const sqlCreatePrice = `INSERT INTO components_products_${shop}_prices(id, date, price, promotion, promotion_description)
		VALUES("${priceID}", '${currentDate}', '${productPrice}', '${productPromotionPrice}', '${productPromotionDescription}')`;
	connection.query(sqlCreatePrice, (error) => {
		if (error) return console.log('createPriceQueryError', error);
	});

	// // CHECK RELATION ID EXIST - BECAUSE OF MANY ERRORS
	// let checkID = `SELECT * FROM ${shop}_components WHERE id = "${connectionID}"`;

	// connection.query(checkID, (error, results) => {
	// 	if (error) return console.error('checkIdRelationError', connectionID, error.message);

	// 	const basicProps = {
	// 		connection,
	// 		shop,
	// 		priceID,
	// 		productID,
	// 	};

	// 	if (results.length > 0) {
	// 		const newConnectionID = getRandomInt(100000, 429496729);
	// 		createRelation({ ...basicProps, connectionID: newConnectionID });
	// 	} else createRelation({ ...basicProps, connectionID });
	// });

	// CREATE PRODUCT PRICE CONNECTIONS
	const sqlCreateProductPriceRelation = `INSERT INTO ${shop}_components(id, entity_id, component_id, component_type, field)
			VALUES("${connectionID}", "${productID}", "${priceID}", "products.${shop}-price", "${shop}Prices")`;
	if (productID && priceID && connectionID && connection) {
		connection.query(sqlCreateProductPriceRelation, (error) => {
			if (error)
				return console.log('RELATION ERROR!', 'ProdID:', productID, 'PriceID:', priceID, 'ConnectID:', connectionID);
		});
	} else console.log('RELATION ERROR!', 'ProdID:', productID, 'PriceID:', priceID, 'ConnectID:', connectionID);
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
	productCategory,
	productPromotionPrice,
	productPromotionDescription,
}) => {
	// CREATE PRODUCT ITEM
	let sqlCreateProduct = `INSERT INTO ${shop}(id, title, created_by_id, updated_by_id, image_url, created_at, updated_at, category)
	VALUES("${productID}", "${productTitle}", 1, 1, "${imageUrl}", "${currentDate}", "${currentDate}", "${productCategory}")`;

	if (productDescription) {
		sqlCreateProduct = `INSERT INTO ${shop}(id, title, created_by_id, updated_by_id, image_url, created_at, updated_at, category, description)
		VALUES("${productID}", "${productTitle}", 1, 1, "${imageUrl}", "${currentDate}", "${currentDate}", "${productCategory}", "${productDescription}")`;
	}

	connection.query(sqlCreateProduct, (error) => {
		if (error) return console.log('createProductQueryError', error);
	});

	// CREATE PRICE AND RELATIONS
	createProductPrice({
		connection,
		shop,
		priceID,
		currentDate,
		productPrice,
		connectionID,
		productID,
		productPromotionPrice,
		productPromotionDescription,
	});
	console.log('create', productTitle);
};

export const addNewProduct = ({
	connection,
	shop,
	productTitle,
	productPrice,
	imageUrl,
	productDescription,
	productCategory,
	productPromotionPrice,
	productPromotionDescription,
}) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const productID = getRandomInt(randomRange[0], randomRange[1]);
	const priceID = getRandomInt(randomRange[0], randomRange[1]);
	const connectionID = getRandomInt(randomRange[0], randomRange[1]);

	let checkID = `SELECT * FROM ${shop} WHERE id = "${productID}"`;
	connection.query(checkID, (error, results) => {
		if (error) return console.log('checkIDError', productTitle, error.message);

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
			productCategory,
			productPromotionPrice,
			productPromotionDescription,
		};

		// CHECK IF ID EXIST
		if (results.length > 0) {
			const newProductID = getRandomInt(100, 429496729);
			createProduct({ ...basicProps, productID: newProductID });
		} else createProduct({ ...basicProps, productID });
	});
};

export const updateProductPrice = (
	connection,
	shop,
	productID,
	productPrice,
	productPromotionPrice,
	productPromotionDescription,
) => {
	const date = new Date();
	const currentDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	const priceID = getRandomInt(randomRange[0], randomRange[1]);
	const connectionID = getRandomInt(randomRange[0], randomRange[1]);

	const checkAllComponents = (data) => {
		data?.forEach((item) => {
			const checkExistingPrices = `SELECT * FROM components_products_${shop}_prices WHERE id = "${item?.component_id}"`;
			connection.query(checkExistingPrices, (error, results) => {
				if (error) return console.error('checkIsExistProd', error?.message, 'id:', item?.component_id);
				results?.forEach((result) => {
					const baseDate = result.date.toISOString().replace('T23:00:00.000Z', '');
					const itemMonth = Number(baseDate.slice(5, 7));
					const itemYear = Number(baseDate.slice(0, 4));
					const itemDay = Number(baseDate.slice(8));
					const currentYear = date.getUTCFullYear();
					const currentMonth = date.getUTCMonth() + 1;
					const currentDay = date.getUTCDate() - 1;

					if (
						itemYear === currentYear &&
						itemMonth === currentMonth &&
						(itemDay === currentDay || itemDay === currentDay - 1)
					) {
						console.log(
							'Cena z dziś istnieje ID:',
							productID,
							'PRICE:',
							productPrice,
							'PROMOTION:',
							productPromotionPrice,
							'DESC:',
							productPromotionDescription,
						);
					} else {
						// CREATE PRICE AND RELATIONS
						createProductPrice({
							connection,
							shop,
							priceID,
							currentDate,
							productPrice,
							connectionID,
							productID,
							productPromotionPrice,
							productPromotionDescription,
						});
						console.log(
							'UPDATE ID:',
							productID,
							'PRICE:',
							productPrice,
							'PROMOTION:',
							productPromotionPrice,
							'DESC:',
							productPromotionDescription,
						);
					}
				});
			});
		});
	};

	const checkExistingComponents = `SELECT * FROM ${shop}_components WHERE entity_id = "${productID}"`;
	connection.query(checkExistingComponents, (error, results) => {
		if (error) return console.log('checkIsExistProd', error?.message);
		if (results?.length > 0) checkAllComponents(results);
	});
};

export const checkIsExist = (connection, shop, productTitle, createCallback, updateCallback, description) => {
	let sql = `SELECT * FROM ${shop} WHERE title = "${productTitle}"`;
	if (description) {
		sql = `SELECT * FROM ${shop} WHERE title = "${productTitle}" AND description = "${description}"`;
	}
	connection.query(sql, (error, results) => {
		if (error) return console.log('checkIsExistProd', error?.message);
		if (results?.length === 0) createCallback();
		if (results?.length > 0) updateCallback(results[0]?.id);
	});
};
