
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://Keitarou:UNawpThgL4W39grv@cluster0.3swe0ry.mongodb.net/todolistDB");

// mongodb+srv://Keitarou:<password>@cluster0.3swe0ry.mongodb.net/?retryWrites=true&w=majority
const itemsSchema = {
    name: {
        type: String,
        required: true
    }
};

const Item = mongoose.model("Item", itemsSchema); 

app.set('view engine', 'ejs');

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// const day = date.getDate();

app.get("/", function(req, res){

    



    Item.find({}).then((foundItems) => {
        if (foundItems.length === 0){
            Item.insertMany(defaultItems).then(() => {
            console.log("Inserted successfully.")
            }).catch((error) => {
            console.log("Error occured: ", error)
            });

            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItem: foundItems});
        }

    }).catch((error) => {
        console.log("Error detected: ", error)
    });




        // res.write("<p>It is not the weekend</p>");
        // res.write("<h1>Boo! I have to work</h1>");
        // res.send();

        // res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res){

    const itemName = req.body.newListItem;
    const listName = req.body.list;
    console.log("itemName"+itemName);
    console.log("listName"+listName);

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then((foundList) => {
            console.log(foundList);
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }   

    // if (req.body.list === "Work") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);

    //     res.redirect("/");
    // }

  
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId).then(()=> {
            console.log("successfully deleted.");
            res.redirect("/");
        }).catch((error)=>{
            console.log("Error occured: ", error);
        });
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(()=> {
            res.redirect("/" + listName);
        }).catch((error) => {
            console.log("Error occured: ", error);
        });
    }

    
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}).then((foundList) => {
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        }else {
            res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
        }
        
    }).catch((error) => {
        console.log("error", error);;
    })
    

    
});


app.post("/work", function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(req, res){
    res.render("about");
})

app.listen(3000, function(){
    console.log("Server started on port 3000");
});