//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('useNewUrlParser', true);

mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb+srv://admin-mo:Test123@cluster0-zwysg.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todoList!",
  
});

const item2 = new Item ({
  name: "Hit the + button to add a new item.",
 
});
const item3 = new Item ({
  name: "<--- Hit this to delete an item.",
 
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function (err) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log("successfully inserted.");
    
//   }
// });


app.get("/", function(req, res) {

  Item.find({}, function(err, items){
// This only runs the first time since we dont have anything in the array
    if (items.length === 0) {

        Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("successfully inserted.");
          
        }
      });
      // doing this will skip the above if statement since it runs it a second time but this time since we have a populated array, it will go to
      // the below else statement and render our list
      res.redirect("/");
    } else {
      
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });


});

app.get("/:listName", function(req, res) {

  const newList =  _.capitalize(req.params.listName);
List.findOne({name: newList}, function(err, foundList) {
   
  if (!err) {
   if(!foundList) {
     // create new list
    const list = new List ({
      name: newList,
      items: defaultItems
    });
  
  list.save();
    res.redirect("/" + newList);
   
  } else {
   // show existing list
   res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
  }

});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const nameOfNewList = req.body.list;


  const item = new Item ({
    name: itemName
});

if(nameOfNewList === "Today") {
  item.save();
  res.redirect("/");
} else{
  List.findOne({name: nameOfNewList}, function(err, foundList) {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + nameOfNewList);

  });
}

  
});


app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Deleted");
        res.redirect("/");
      }
    });

  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
    });
  }
  
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
