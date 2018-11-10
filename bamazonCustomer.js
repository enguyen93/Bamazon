//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon_db"
});

// connection.connect(function (err) {
//   if (err) throw err;
//   start();
// });

//Main function to start the app
function test() {
  inventoryCheck();
}
test();

//function that contains inquirer to receive input from user 
function start() {

  inquirer.prompt([

    {
      type: "input",
      name: "choice",
      message: "Please enter the ID of the product that you would like to buy"
    },
    {
      type: "input",
      name: "amount",
      message: "Please enter the amount that you would like to buy of said ID"
    }
  ]).then(function (answers) {
    var item = answers.choice;
    var amount = answers.amount;
    //variable that will show certain columns from the products table from the DB
    var query = "SELECT * FROM PRODUCTS WHERE ?";
    //the next line shows the item from the DB that the user gave input for using the item_id #
    connection.query(query, { item_id: item }, function (err, data) {
      if (err) throw err;
      //a catch for if the item does not exist within the length of the list of items
      if (!data.length) {
        console.log("That item does not exist, please try again");
      } else {
        //if statement for if the item is within the quantity range
        if (amount <= data[0].stock_quantity) {
          console.log("We have it in stock, continuing to place order.");
          //shorthand to update the database for the item that the user has purchased
          var newAmount = data[0].stock_quantity - amount;
          connection.query(
            "UPDATE products SET stock_quantity = " + newAmount + " WHERE item_id = " + item + ";"
          );
          console.log("You have bought " + amount + " of " + data[0].product_name + "\nThanks for shopping at Bamazon!");
          //ending the connection
          connection.end();
          //if the user requests more than what the database has it loops them back to ask for a lower amount
        } else {
          console.log("We do not have that much in stock! Please try again in a lower amount.");
          inventoryCheck();
        }
      }
    })

  });
}

function inventoryCheck() {
  queryStr = 'SELECT * FROM products';

  connection.query(queryStr, function (err, data) {
    if (err) throw err;

    console.log('Existing Inventory: ');
    console.log('...................\n');

    var prettyString = '';
    for (var i = 0; i < data.length; i++) {
      prettyString = '';
      prettyString += 'Item ID: ' + data[i].item_id + '  ||  ';
      prettyString += 'Product Name: ' + data[i].product_name + '  ||  ';
      prettyString += 'Price: $' + data[i].price + '\n';

      console.log(prettyString);

    }
    start();
  });
}
