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
    mngrMenu();
});

function mngrMenu(){
    inquirer.prompt([
    {
        type: "list",
        name: "mngrMenu",
        message: "Please select a command",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            "Exit"
        ]
    }
    ]).then(function(answers) {
        switch(answers.mngrMenu){
            case "View Products for Sale":
                viewProd();
                break;
            case "View Low Inventory":
                viewLow();
                break;
            case "Add to Inventory":
                depMenu();
                break;
            case "Add New Product":
                addNew();
                break;
            case "Exit":
                exit();
                break;
        }
    });
}

function viewProd(){
    console.log("|--- View all Products ---|");

    var departmentNameArr = [];
    var departmentIDArr = [];

    connection.query("SELECT DISTINCT departments.department_name, departments.department_id FROM products INNER JOIN departments ON products.department_id=departments.department_id", function(err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++){
            departmentNameArr.push(res[i].department_name);
            departmentIDArr.push(res[i].department_id);
        }
    });

    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        for (var j = 0; j < departmentNameArr.length; j++){
            console.log("\n|--- " + departmentNameArr[j] + " ---|")
            for (var i = 0; i < res.length; i++){
                if(res[i].department_id === departmentIDArr[j]){
                    console.log("ID: " + res[i].item_id + " - " + res[i].product_name + " - $" + res[i].price + " - In Stock: " + res[i].stock_quantity);
                }
            }
            console.log("|--- " + departmentNameArr[j] + " ---|\n")
        }
        mngrMenu();
    });
}

function viewLow(){
    console.log("|--- View low inventory ---|");
    var departmentNameArr = [];
    var departmentIDArr = [];

    connection.query("SELECT DISTINCT departments.department_name, departments.department_id FROM products INNER JOIN departments ON products.department_id=departments.department_id", function(err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++){
            departmentNameArr.push(res[i].department_name);
            departmentIDArr.push(res[i].department_id);
        }
    });

    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;

        for (var j = 0; j < departmentNameArr.length; j++){
            console.log("\n|--- " + departmentNameArr[j] + " ---|")
            for (var i = 0; i < res.length; i++){
                if(res[i].department_id === departmentIDArr[j]){
                    console.log("ID: " + res[i].item_id + " - " + res[i].product_name + " - $" + res[i].price + " - In Stock: " + res[i].stock_quantity);
                }
            }
            console.log("|--- " + departmentNameArr[j] + " ---|\n")
        }
        mngrMenu();
    });
}

function depMenu(){
    console.log("|--- Add more of a Product ---|");

    connection.query("SELECT DISTINCT departments.department_name, departments.department_id FROM products INNER JOIN departments ON products.department_id=departments.department_id", function(err, res) {
        if (err) throw err;

        var departmentNameArr = [];
        var departmentIDArr = [];
        for (var i = 0; i < res.length; i++){
            departmentNameArr.push(res[i].department_name);
            departmentIDArr.push(res[i].department_id);

        }
        
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
            
            prodMenu(depID);

        });
    });
}

function prodMenu(depID){

    connection.query("SELECT * FROM products WHERE department_id="+depID, function(err, res) {
        if (err) throw err;

        var prodArr = [];

        for (var i = 0; i < res.length; i++){
            prodArr.push(res[i].product_name + " - " + res[i].stock_quantity);
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
            var currentStock = res[indexItem].stock_quantity;

            qtyMenu(id, currentStock);

        });
    });
}

function qtyMenu(id, currentStock){
    
    inquirer.prompt([
        {
            type: 'input',
            name: 'user_qty',
            message: "How many would you like to order?"
        }
    ]).then(function(answers) {
        var qty = +answers.user_qty;
        
        if (qty > 0){
            var newQty = qty + currentStock;
            var query = connection.query(
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
                    console.log("Your inventory has been replenished!");
                    mngrMenu();                    
                }
              );
        } else {
            console.log("You must order a quantity greater than 0");
            qtyMenu(id);
        }
        
    });
}

function addNew(){
    var departmentNameArr = [];
    var departmentIDArr = [];
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;


        for (var i = 0; i < res.length; i++){
            departmentNameArr.push(res[i].department_name);
            departmentIDArr.push(res[i].department_id); 
        }

        console.log("|--- Add a new Product ---|");
        inquirer.prompt([
            {
                type: 'input',
                name: 'pr_name',
                message: "What is the product name?"
            },
            {
                type: 'input',
                name: 'pr_price',
                message: "What is the price?"
            },
            {
                type: 'checkbox',
                message: 'Which department does this product belong in?',
                name: 'pr_dep',
                choices: departmentNameArr,
                validate: function(answer) {
                    console.log(answer.length);
                    if (answer.length !== 1) {
                        
                        return 'You must choose 1 department.';
                    }
                    return true;
                }
            }
        ]).then(function(answers) {

            var pr_name = answers.pr_name;
            var pr_price = +answers.pr_price;
            var index = departmentNameArr.indexOf(answers.pr_dep[0]);

            var pr_dep = departmentIDArr[index];
            console.log(pr_dep);
            var query = connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: pr_name,
                    department_id: pr_dep,
                    price: pr_price,
                    stock_quantity: 0,
                    product_sales: 0.00
                },
                function(err, res) {
                    mngrMenu();
                }
            );
        });
    });


}

function exit() {
    connection.end();
}