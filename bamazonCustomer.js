var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({

    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Aura*6983",
    database: "bamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    depMenu();
});

function depMenu(){
    connection.query("SELECT DISTINCT departments.department_name, departments.department_id FROM products INNER JOIN departments ON products.department_id=departments.department_id", function(err, res) {
        if (err) throw err;

        var departmentNameArr = [];
        var departmentIDArr = [];
        for (var i = 0; i < res.length; i++){
            departmentNameArr.push(res[i].department_name);
            departmentIDArr.push(res[i].department_id);

        }

        departmentNameArr.push("Exit");
        
        inquirer.prompt([
        {
            type: "list",
            name: "depMenu",
            message: "Please select a department",
            choices: departmentNameArr
        }
        ]).then(function(answers) {
            var index = departmentNameArr.indexOf(answers.depMenu);
            var depID = departmentIDArr[index];
            
            if (answers.depMenu === "Exit"){
                exit();
            } else {
                prodMenu(depID);
            }
        });
    });
}

function prodMenu(depID){

    connection.query("SELECT * FROM products WHERE department_id="+depID, function(err, res) {
        if (err) throw err;

        var prodArr = [];

        for (var i = 0; i < res.length; i++){
            prodArr.push(res[i].product_name + " - $" + res[i].price);
        }
        
        inquirer.prompt([
        {
            type: "list",
            name: "prodMenu",
            message: "Please select a product",
            choices: prodArr
        }
        ]).then(function(answers) {

            var pickedProd = answers.prodMenu;
            var indexItem = prodArr.indexOf(pickedProd);
            var id = res[indexItem].item_id;
            var maxQty = res[indexItem].stock_quantity;
            var price = res[indexItem].price;
            var sales = res[indexItem].product_sales;

            qtyMenu(id, maxQty, price, sales);
        });
    });
}

function qtyMenu(id, maxQty, price, sales){

    inquirer.prompt([
        {
            type: 'input',
            name: 'user_qty',
            message: "How many would you like to buy?"
        }
    ]).then(function(answers) {
        var qty = +answers.user_qty;
        if (qty < maxQty){
            var newQty = maxQty - qty;
            var query1 = connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: newQty
                  },
                  {
                    item_id: id
                  }
                ],
                function(err, res) {
                    console.log("Your total will come to: $" + qty * price);
                    
                    var newSales = sales + (qty*price);
                    var query2 = connection.query(
                      "UPDATE products SET ? WHERE ?",
                      [
                        {
                          product_sales: newSales
                        },
                        {
                          item_id: id
                        }
                      ],
                      function(err, res) {
                          depMenu();                    
                      }
                    );
                }
              );

        } else {
            console.log("Unfortunately we do not have enough of this item to fulfil your order.");
            qtyMenu(id, maxQty, price);
        }
        
    });
}

function exit() {
    connection.end();
}