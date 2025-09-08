if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const cors = require('cors');
const express = require('express')
const path = require('path')
const engine = require('ejs-mate')
const mongoose = require("mongoose");

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // frontend dev URLs
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// all routes
const userRoutes = require('./routes/user.route');


const dbUrl = process.env.dbUrl || 'mongodb://localhost:27017/expenseTracker'
mongoose.connect(dbUrl)
.then(()=>{
    console.log("Database Connected succesfully")
})
.catch(()=>{
    console.log("Fail to connect....")
})


// middlewares
app.engine('ejs', engine);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended: true }));            //Converts the form data into a JavaScript object
app.use(express.json()) 



app.get('/',(req,res)=>{
    res.send("Server running");
})


// using all routes or we can say calling
app.use(userRoutes)


const port = process.env.PORT || 8080;
app.listen(port,()=>{
    console.log(`server connected successfully at port ${port}`);
})