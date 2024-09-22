const express = require("express");
const mysqlConnection = require("../utils/database.js");
const Router = express.Router();
Router.use(express.json());
const bodyParser = require("body-parser");
Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require("method-override");
Router.use(methodOverride("_method"));

// DELETE route to delete a specific order by ID
Router.get("/ordertable/delete/:id", (req, res) => {
    const orderId = req.params.id;
    console.log("Order ID to delete:", orderId);
    try {
        const deleteOrderSQL = `
            DELETE order_table, customer, product
            FROM order_table
            LEFT JOIN customer ON order_table.customer_id = customer.customer_id
            LEFT JOIN product ON order_table.product_id = product.product_id
            WHERE order_table.order_id = ?`;
        mysqlConnection.promise().query(deleteOrderSQL, [orderId]);
        res.redirect("/ordertable/");
    } catch (err) {
        console.error(err);
        res.json({ message: "Error deleting order" });
    }
});

// Fetch all customers
Router.get("/customer", (req, res) => {
    mysqlConnection.query("SELECT * FROM customer", (err, results, fields) => {
        if (!err) {
            res.send(results);
        } else {
            res.status(404);
            console.log(err);
        }
    });
});

// Fetch specific customer by ID
Router.get("/customer/:id", (req, res) => {
    const param_id = req.params.id;
    mysqlConnection.query(`SELECT * FROM customer WHERE customer_id = ${param_id}`, (err, results, fields) => {
        if (!err) {
            res.send(results);
        } else {
            console.log(err);
        }
    });
});

// Home route redirects to order list
Router.get("/", (req, res) => {
    res.redirect("/ordertable/");
});

// Fetch and display all orders
Router.get("/ordertable/", (req, res) => {
    const sql = `
        SELECT
            order_table.order_id,
            customer.customer_name,
            product.product_name,
            order_table.order_date
        FROM
            order_table
        INNER JOIN customer ON order_table.customer_id = customer.customer_id
        INNER JOIN product ON order_table.product_id = product.product_id;`;
    mysqlConnection.query(sql, (err, results, fields) => {
        if (!err) {
            res.render("index", { title: "Ordertable", ordertable: results });
        } else {
            res.status(404).json({ message: "Orders not found." });
            console.log(err);
        }
    });
});

// About Page
Router.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

// Create a new order
Router.get("/ordertable/create/", (req, res) => {
    res.render("create", { title: "Create Order ☕" });
});

Router.post("/ordertable/create/", async (req, res) => {
    const { customerName, phoneNumber, productName, membershipID } = req.body;

    const orderDate = new Date().toISOString().split("T")[0];

    try {
        const [customerResult] = await mysqlConnection.promise().query(
            "INSERT INTO customer (customer_name, contact_info, membership_id) VALUES (?, ?, ?)",
            [customerName, phoneNumber,membershipID]
        );

        const customerID = customerResult.insertId;
        const [productRow] = await mysqlConnection.promise().query(
            "SELECT product_id FROM product WHERE LOWER(product_name) = LOWER(?)",
            [productName]
        );

        if (productRow.length === 0) {
            res.json({ message: "Selected product not found" });
            return;
        }

        const productID = productRow[0].productID;

        const insertOrderSQL = "INSERT INTO order_table (customer_id, product_id, order_date) VALUES (?, ?, ?)";
        const orderValues = [customerID, productID, orderDate];

        const [orderResult] = await mysqlConnection.promise().query(insertOrderSQL, orderValues);
        console.log("Order created:", orderResult.insertId);
        res.redirect("/ordertable/");
    } catch (err) {
        console.error(err);
        res.json({ message: "Error creating order" });
    }
});

// Update Order Form
Router.get("/ordertable/:id/update", (req, res) => {
    const param_id = req.params.id;
    console.log(param_id);
    const sql = `
        SELECT
            order_id,
            customer.customer_name,
            product.product_name
        FROM
            order_table
        INNER JOIN customer ON order_table.customer_id = customer.customer_id
        INNER JOIN product ON order_table.product_id = product.product_id
        WHERE order_id = ${param_id};`;
    mysqlConnection.query(sql, (err, results, fields) => {
        if (!err) {
            res.render("update", { title: "Update Order", ordertable: results });
        } else {
            res.status(404).json({ message: "Order ID not found." });
            console.log(err);
        }
    });
});

// PUT update order
Router.put("/ordertable/:id", async (req, res) => {
    const orderId = req.params.id;
    const { customerName, productName } = req.body;

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

        const [updateCustomerResult] = await mysqlConnection.promise().query(updateCustomerNameSQL, [customerName, orderId]);
        const [updateProductResult] = await mysqlConnection.promise().query(updateProductNameSQL, [productName, orderId]);

        if (updateCustomerResult.affectedRows === 1 && updateProductResult.affectedRows === 1) {
            res.redirect("/ordertable/");
        } else {
            res.json({ message: "Order not found" });
        }
    } catch (err) {
        console.error(err);
        res.json({ message: "Error updating order" });
    }
});

// Fetch all bills
Router.get("/bill/all", (req, res) => {
    mysqlConnection.query("SELECT * FROM bill", (err, results, fields) => {
        if (!err) {
            res.send(results);
        } else {
            res.status(404);
            console.log(err);
        }
    });
});

// Search for a bill by customer name
Router.get("/bill/search/", (req, res) => {
    const customername = req.query.customerName;
    mysqlConnection.query(
        `SELECT billID, customer.customerName, totalPrice 
        FROM bill 
        INNER JOIN customer ON customer.customerID = bill.customerID 
        WHERE customerName = "${customername}"`,
        (err, results, fields) => {
            if (!err) {
                console.log(results);
                res.render("billShow", { title: "Bill 💰", bill: results });
            } else {
                res.status(404);
                console.log(err);
            }
        }
    );
});

module.exports = Router;
