const express = require("express");
const mongoose= require("mongoose")
const _ = require("lodash")
const alert = require('alert');
const app = express();

mongoose.connect("mongodb+srv://admin_Ahmet:Aa1598756.@testcluster.0bapz.mongodb.net/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true });

app.use(express.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"))
 

const itemSchema= mongoose.Schema({
    title:String
})

const Item = mongoose.model("Item", itemSchema);

const item1= new Item({
    title:"Welcome"
});
const item2= new Item({
    title:"Hit '+' button to add new item"
});
const item3= new Item({
    title:"<-- Hit this to delete"
});

const defaultItem = [item1,item2,item3]

const listSchema={
    name:String,
    items:[itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

    Item.find({}, function(err, items){
        if(items.length === 0){
            Item.insertMany(defaultItem, function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Added")
                }
            });
            res.redirect("/")
        }else{
            res.render("list", {list: "Today",newItemList:items})
        }
    })

})

app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName= req.body.list;

    const item= new Item({
        title:itemName
    });

    if(listName === "Today"){
        item.title.trim() === ""  ? alert("Item can't be empty") : item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName)
        })
    }

})

app.post("/delete", function(req,res){
    const customID = req.body.checkbox;
    const listName = req.body.list

    if(listName === "Today"){
        
        Item.findByIdAndRemove(customID, function(err){
            if(!err){
                console.log("Deleted")
                res.redirect("/")      
            }
       
    })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:customID}}}, function(err, foundlist){
            if(!err){
                res.redirect("/" + listName)
            }else{
                console.log(err)
            }
        })
    }
    
       
})

app.get("/:title", function(req,res){ 

    const customListName=_.capitalize(req.params.title)

    List.findOne({name:customListName}, function(err, foundList){
        if(!foundList){
            const list= new List({
                name:customListName,
                items:defaultItem
            });
            list.save();
            res.redirect("/"+ customListName)
        }else{
            res.render("list",{list: foundList.name, newItemList:foundList.items})
        }
    });



})

let port = process.env.PORT;

if(port == null || port==""){
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started"+ port)
})