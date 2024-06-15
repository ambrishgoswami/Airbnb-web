const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const Review= require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(() => {
    console.log("connected to DB");
})
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(MONGO_URL);

}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/", (req, res) => {                                        
    res.send("Hi,I am root");
});
// index route

 app.get("/listings",wrapAsync( async(req, res) => {
  const allListings= await Listing.find({});
  res.render("listings/index.ejs",{allListings});
      
}));


// new route

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show route

app.get("/listings/:id",wrapAsync( async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));



// create route
app.post("/listings",wrapAsync(async(req,res,next)=>{
   if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
   }
   const newListing= new Listing(req.body.listing);
   
   if(!newListing.title){
    throw new ExpressError(400,"Title is missing");
   }
   if(!newListing.description){
    throw new ExpressError(400,"Description is missing");
   }
  await newListing.save();

    res.redirect("/listings");
  
}));


//edit route

app.get("/listings/:id/edit",wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));


//update route

app.put("/listings/:id",wrapAsync( async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
       }
    let { id } = req.params;
     await Listing.findByIdAndUpdate(id,{... req.body.listing});
    res.redirect(`/listings/${id}`);
}));


//delete route

app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
    res.redirect("/listings");
}));




//review
app.post("/listings/:id/reviews",async(req,res)=>{
 let listing=await Listing.findById(req.params.id)
 let newReview=new Review(req.body.review);

 listing.reviews.push(newReview);
 await newReview.save();
 await listing.save();

 res.redirect(`/listings/${listing._id}`);
})

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "my new villa",
//         deacription: "by the beach",
//         price: 1200,
//         location: "calangute,Goa",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// });



app.all("*",(req,res,next)=>{
    next(new ExpressError("Page Not Found",404));
});






app.use((err,req,res,next)=>{
    let{statusCode=500, message="something went wrong!"}=err;
    // res.status(statusCode).send(meassage);
    res.render("error.ejs",{message});
})


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});