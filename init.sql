CREATE DATABASE IF NOT EXISTS coffeeshopproject;
USE coffeeshopproject;

CREATE TABLE IF NOT EXISTS customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100),
  contact_info VARCHAR(255),
  membership_id INT
);

CREATE TABLE IF NOT EXISTS product (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS order_table (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  product_id INT,
  quantity INT,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (product_id) REFERENCES product(product_id)
);

INSERT INTO product (product_name) VALUES ('Espresso'), ('Latte'), ('Cappuccino'),('Black Coffee'),('Muffin'),('Croissant'),('Bagel'),('Brownie'),('Iced Coffee'),('Smoothie');

-- docker run --rm -v coffeeshop-practice_mysql_data:/volume -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /volume . 

-- docker run --rm -v yourprojectname_mysql_data:/volume -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /volume 