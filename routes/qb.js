
const express = require("express");
const connectDB = require("../utils/database.js");
const Router = express.Router();
Router.use(express.json());
const bodyParser = require("body-parser");
Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require("method-override");
Router.use(methodOverride("_method"));

let mysqlConnection;

// Establish connection before routes
Router.use(async (req, res, next) => {
    if (!mysqlConnection) {
        try {
            mysqlConnection = await connectDB();
            next();
        } catch (err) {
            res.status(500).send("Database connection error.");
        }
    } else {
        next();
    }
});

// DELETE route
Router.get("/ordertable/delete/:id", async (req, res) => {
    const orderId = req.params.id;
    try {
        
        await mysqlConnection.query("DELETE FROM order_table WHERE order_id = ?", [orderId]);
        res.redirect("/ordertable/");
    } catch (err) {
        console.error("Error while deleting order:", err);
        res.json({ message: "Error deleting order" });
    }
});
// Fetch all customers
Router.get("/customer", async (req, res) => {
    try {
        const [results] = await mysqlConnection.query("SELECT * FROM customer");
        res.send(results);
    } catch (err) {
        console.log(err);
        res.status(404).send("Error fetching customers.");
    }
});

// Fetch specific customer
Router.get("/customer/:id", async (req, res) => {
    const param_id = req.params.id;
    try {
        const [results] = await mysqlConnection.query(`SELECT * FROM customer WHERE customer_id = ?`, [param_id]);
        res.send(results);
    } catch (err) {
        console.log(err);
    }
});

// Home
Router.get("/", (req, res) => {
    res.redirect("/ordertable/");
});

// All orders
Router.get("/ordertable/", async (req, res) => {
    const sql = `
        SELECT
            order_table.order_id,
            customer.customer_name,
            customer.contact_info,
            product.product_name,
            order_table.quantity,
            order_table.order_date
        FROM
            order_table
        INNER JOIN customer ON order_table.customer_id = customer.customer_id
        INNER JOIN product ON order_table.product_id = product.product_id 
        ORDER BY order_table.order_id DESC;`;

    try {
        const [results] = await mysqlConnection.query(sql);
        res.render("index", { title: "Ordertable", ordertable: results });
    } catch (err) {
        console.log(err);
        res.status(404).json({ message: "Orders not found." });
    }
});

// About
Router.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

// Create order
Router.get("/ordertable/create/", (req, res) => {
    res.render("create", { title: "Create Order ☕" });
});

Router.post("/ordertable/create/", async (req, res) => {
    const { customerName, phoneNumber, productName, membershipID, newquantity } = req.body;
    const orderDate = new Date().toISOString().split("T")[0];

    try {
        const [customerResult] = await mysqlConnection.query(
            "INSERT INTO customer (customer_name, contact_info, membership_id) VALUES (?, ?, ?)",
            [customerName, phoneNumber, membershipID]
        );

        const customerID = customerResult.insertId;

        const [productRow] = await mysqlConnection.query(
            "SELECT product_id FROM product WHERE product_name = lower(?)",
            [productName]
        );

        if (productRow.length === 0) {
            return res.json({ message: "Selected product not found" });
        }

        const productID = productRow[0].product_id;

        const insertOrderSQL = "INSERT INTO order_table (customer_id, product_id, quantity, order_date) VALUES (?, ?, ?, ?)";
        const orderValues = [customerID, productID, newquantity, orderDate];

        await mysqlConnection.query(insertOrderSQL, orderValues);

        res.redirect("/ordertable/");
    } catch (err) {
        console.error(err);
        res.json({ message: "Error creating order" });
    }
});

// Update form
Router.get("/ordertable/:id/update", async (req, res) => {
    const param_id = req.params.id;

    const sql = `
        SELECT
            order_id,
            customer.customer_name,
            product.product_name,
            quantity
        FROM
            order_table
        INNER JOIN customer ON order_table.customer_id = customer.customer_id
        INNER JOIN product ON order_table.product_id = product.product_id
        WHERE order_id = ?`;

    try {
        const [results] = await mysqlConnection.query(sql, [param_id]);
        res.render("update", { title: "Update Order", order_table: results });
    } catch (err) {
        console.log(err);
        res.status(404).json({ message: "Order ID not found." });
    }
});

// PUT update
Router.put("/ordertable/:id", async (req, res) => {
    const orderId = req.params.id;
    const { customerName, productName, newquantity } = req.body;

    try {
        const updateCustomerNameSQL = `
            UPDATE customer AS c
            JOIN order_table AS o ON c.customer_id = o.customer_id
            SET c.customer_name = ?
            WHERE o.order_id = ?`;

        const updateProductNameSQL = `
            UPDATE product AS p
            JOIN order_table AS o ON p.product_id = o.product_id
            SET p.product_name = ?
            WHERE o.order_id = ?`;

        const updateQuantitySQL = `
            UPDATE order_table
            SET quantity = ?
            WHERE order_id = ?`;

        const [updateCustomerResult] = await mysqlConnection.query(updateCustomerNameSQL, [customerName, orderId]);
        const [updateProductResult] = await mysqlConnection.query(updateProductNameSQL, [productName, orderId]);
        const [updateQuantityResult] = await mysqlConnection.query(updateQuantitySQL, [newquantity, orderId]);

        if (updateCustomerResult.affectedRows === 1 || updateProductResult.affectedRows === 1 || updateQuantityResult.affectedRows === 1) {
            res.redirect("/ordertable/");
        } else {
            res.json({ message: "Order not found" });
        }
    } catch (err) {
        console.error(err);
        res.json({ message: "Error updating order" });
    }
});

// Search by Order ID
Router.get('/showOrder/', async (req, res) => {
    const searchOrderID = req.query.orderId;
    console.log(searchOrderID);

    const query = `
        SELECT 
            order_id, 
            order_date, 
            customer.customer_name, 
            product.product_name, 
            quantity, 
            customer.contact_info 
        FROM order_table
        INNER JOIN customer ON order_table.customer_id = customer.customer_id
        INNER JOIN product ON order_table.product_id = product.product_id
        WHERE order_id = ?`;

    try {
        const [results] = await mysqlConnection.query(query, [searchOrderID]);
        res.render('showOrder', { title: 'Searching Order', searching: results });
    } catch (err) {
        console.log(err);
        res.status(404).json({ message: "Search failed" });
    }
});

module.exports = Router;
