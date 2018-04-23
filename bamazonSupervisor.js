var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('easy-table')

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
    sprMenu();
});

function sprMenu(){
    inquirer.prompt([
    {
        type: "list",
        name: "sprMenu",
        message: "Please select a command",
        choices: [
            "View Product Sales by Department",
            "Create New Department",
            "Exit"
        ]
    }
    ]).then(function(answers) {
        switch(answers.sprMenu){
            case "View Product Sales by Department":
                viewDepSales();
                break;
            case "Create New Department":
                addDep();
                break;
            case "Exit":
                exit();
                break;
        }
    });
}

function viewDepSales(){
    console.log("\n|--- Department Sales ---|");
    connection.query("SELECT products.department_id AS 'Department ID', departments.department_name AS 'Department Name', departments.over_head_costs AS 'Over Head Costs',SUM(product_sales) AS 'Total Sales', (SUM(product_sales) - over_head_costs) AS 'Total Profits' FROM products INNER JOIN departments ON departments.department_id=products.department_id GROUP BY products.department_id", function(err, res) {
        if (err) throw err;

        console.log(Table.print(res));
        sprMenu();
    });
}

function addDep(){
    console.log("|--- Add a new Department ---|");
    inquirer.prompt([
        {
            type: 'input',
            name: 'dep_name',
            message: "What is the name of the department?"
        },
        {
            type: 'input',
            name: 'dep_cost',
            message: "What is the Over Head Cost for this department?"
        }
    ]).then(function(answers) {

        let dep_name = answers.dep_name;
        let dep_cost = answers.dep_cost;

        var query = connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: dep_name,
                over_head_costs: dep_cost
            },
            function(err, res) {
                sprMenu();
            }
        );
    });
}

function exit() {
    connection.end();
}

 
