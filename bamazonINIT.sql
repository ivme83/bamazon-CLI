DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  product_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("shirt", "clothing", 5.00, 3),
("pants", "clothing", 10.00, 10),
("jacket", "clothing", 15.00, 8),
("Green Eggs and Ham", "books", 5.00, 3),
("War and Peace", "books", 7.50, 6),
("It", "books", 8.00, 10),
("Hockey Stick", "sports", 15.00, 1),
("Basketball", "sports", 12.00, 3),
("Helmet", "sports", 20.00, 5),
("chips", "food", 2.50, 100);

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(50) NOT NULL,
  over_head_costs DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES
("sports",10000),
("food", 5000),
("books", 10000),
("clothing", 12000),
("electronics", 20000),
("shoes", 16000),
("kitchen", 8000);

SELECT products.department_id AS "Department ID", departments.department_name AS "Department Name", departments.over_head_costs AS "Over Head Costs",SUM(product_sales) AS "Total Sales", (SUM(product_sales) - over_head_costs) AS "Total Profits"
FROM bamazonDB.products
INNER JOIN bamazonDB.departments ON departments.department_id=products.department_id
GROUP BY products.department_id;