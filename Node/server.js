const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const cors=require('cors')
const router=express.Router();
var compression = require('compression');
const config = require('./config/config')
// var path = require('path');

const auth=require('./Routes/authentication')(router)

mongoose.connect(config.uri,{ useNewUrlParser: true,useFindAndModify: false,useCreateIndex: true,useUnifiedTopology:true },(dberror)=>{
    if(dberror){
        console.log("Cannot connect to Database "+config.db);
    }
    else{
        console.log("Connected to database "+config.db);
    }
});

app = express();

app.listen(config.port, function () 
{
    console.log('App listening on port '+config.port+'!');
});

app.use(compression());

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(cors({
    // origin: 'https://www.humaratruck.com'
}));

// app.use(express.static('/home/ubuntu/BillApp/client'));

app.use("/api/authentication",auth)

// app.use((request,response,next)=>
// {
//   const error=new Error("Cannot Serve "+request.method+" Request from "+request.url);
//   error.status=404;
//   next(error);
// });

app.use((error,request,response,next)=>{
    response.status(error.status||500).json({success:false,error:error.message})
})

// app.get('*', function(req, res)
// {
//   res.sendFile('index.html',{root:path.join('/home/ubuntu/BillApp/client/')});
// });