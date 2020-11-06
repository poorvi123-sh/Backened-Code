let path=require('path');
let express=require('express');
let multer=require('multer');
const { response } = require('express');
const { Console } = require('console');
const ObjectId=require('mongodb').ObjectId;
let app=express();
const MongoClient=require('mongodb').MongoClient;

app.use(express.static(path.join(__dirname,'public3')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});

var storage=multer.diskStorage({
    destination :(req,file,cb)=>{
        cb(null,path.join(__dirname,'public3','imgs'));
    },
    filename:(req,file,cb)=>{
        const fileName=Date.now()+"-"+file.originalname.toLowerCase().split('').join('-');
        cb(null,fileName);
    }
});
let multerObject=multer({storage:storage});
app.post("/users",multerObject.single('photo'),(req,res)=>{
    const data=req.body; 
    const file=req.file; 
    const savedFn=file.filename;
    MongoClient.connect('mongodb://localhost:27017',function(err,con){
        if(err)
        throw(err);
        var db=con.db('blog');
        db.collection("userprofile").insertOne({userid:data.userid,name:data.name,contact:data.contact,email:data.email,password:data.password,age:data.age,city:data.city,photo:savedFn},function(err,result){
           if(err)
           throw err;
           console.log(result.insertedCount+"Row inserted");
           console.log("Id"+result.insertedId);
           con.close();
           
        })
    })

   
 

});

app.post("/product",multerObject.single('photo'),(req,res)=>{
  const postdata=req.body; 
  console.log(postdata);
  const file=req.file; 
  const savedFn=file.filename;
  MongoClient.connect('mongodb://localhost:27017',function(err,con){
      if(err)
      throw(err);
      var db=con.db('blog');
      db.collection("product").insertOne({productid:postdata.productid,name:postdata.name,desc:postdata.desc,price:postdata.price,photo:savedFn},function(err,result){
         if(err)
         throw err;
         console.log(result.insertedCount+"Row inserted");
         console.log("Id"+result.insertedId);
         con.close();
         
      })
  })

 


});

const authMap=new Map();
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
  });

  app.post("/login",function(req,res){
    const loginData=req.body;
    console.log(loginData);     
   MongoClient.connect('mongodb://localhost:27017',function(err,con){
   if(err)
   throw err;
   var db=con.db('blog')

   db.collection('userprofile').find({userid:loginData.userid,password:loginData.password})
   .toArray((err,result)=>{
    if(err)
    throw err;
      console.log(result);
   if(result && result.length>0){                  
     const name=result[0].name;
     const token=loginData.userid;
      authMap.set(token,true);
      console.log("success");
      res.status(200).json({status:'SUCCESS',token:token,name:name});
      console.log(name) ;
      console.log(token) ;    
  }
 
  else{
     console.log("fail");
     res.json({status:'FAIL',token:null,name:null});
 }

   })
   
     
     })
     
     })




       

const check_auth=(req, res, next) => {
  console.log("-----check_auth-------");
  
    console.log(authMap);  
    
    const authHeader=req.headers.authorization;
    console.log(authHeader);   
    let isAuthenticated=false;
    if(authHeader){
      const token = authHeader.split(" ")[1];  
      console.log("Request By : "+token); 
      if(authMap.get(token)){
        isAuthenticated=true;      
      }
    }
    if(isAuthenticated){
      next();  
    }else{
      res.json({ message: "Auth failed!" });
    }
    console.log("-----check_auth-------Bye");
  
}

app.use(check_auth);
app.get("/logout",(req,res)=>{
  const authHeader=req.headers.authorization;
  const token = authHeader.split(" ")[1];  
  authMap.delete(token);
  res.send({ message: "Done" });
});



app.get("/users",(req,res)=>{
   
    MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true})
    .then(client=>{
      const db=client.db('blog');
      const collection=db.collection('userprofile');
      collection.find({}).toArray(function(err,response){
        if(err)
        throw err;
        console.log(response);
        let users=[...response];
        users.map((u)=>u.photo="imgs/"+u.photo);
        console.log(users);
        res.send(users);

      })
    })
        
    });

    app.get("/product",(req,res)=>{
   
      MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true})
      .then(client=>{
        const db=client.db('blog');
        const collection=db.collection('product');
        collection.find({}).toArray(function(err,response){
          if(err)
          throw err;
          console.log(response);
          let users=[...response];
          users.map((u)=>u.photo="imgs/"+u.photo);
          console.log(users);
          res.send(users);
  
        })
      })
          
      });

      app.get('/product/:productid',(req,res)=>{
        const productid=req.params.productid;
        // console.log(sno);
        MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true})
        .then(client=>{
          const db=client.db('blog');
          const collection=db.collection('product');
          collection.findOne({productid:productid}).then(response=>res.status(200).json(response))
          .catch(error=>console.error(error));
          console.log(productid);
        })
      })
    
      app.put("/product/:productid",multerObject.single('photo'),function(req,res){
        const data=req.body; 
  console.log(data);
  
       
        MongoClient.connect('mongodb://localhost:27017',function(err,con){
          if(err)
          throw err;
          var db=con.db('blog')
          db.collection('product').update({
            "productid":req.params.productid,
          
        },{
          $set:{
          
            "name":req.body.name,
            "desc":req.body.desc,
            "price":req.body.price
          }
        },function(err,response){
          if(err)
          throw err;
          console.log(response);
         
  
        })
      })
    })

    app.delete("/product/:productid",function(req,res){
       
      MongoClient.connect('mongodb://localhost:27017',function(err,con){
        if(err)
        throw err;
        var db=con.db('blog')
        db.collection('product').deleteOne({
          "productid":req.params.productid
        },function(err,response){
          if(err)
          throw err;
          console.log(response);

        })
          
        
      })
  })
      app.post("/blog",function(req,res){
        let data=req.body;
        console.log(data);
        MongoClient.connect('mongodb://localhost:27017',(err,con)=>{
          if(err)
        throw(err);
        var db=con.db('blog');
        db.collection("myblog").insertOne({title:data.title,name:data.name,address:data.address},function(err,result){
          if(err)
          throw err;
          console.log(result.insertedCount+"Row inserted");
          console.log("Id"+result.insertedId);
          con.close()
        })
           
            
      })        
    
    
    });

    app.get("/blog",(req,res)=>{
   
      MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true})
      .then(client=>{
        const db=client.db('blog');
        const collection=db.collection('myblog');
        collection.find({}).toArray(function(err,response){
          if(err)
          throw err;
          console.log(response);
          res.send(response);
          
  
        })
      })
    })      
   
    
app.listen(3000,function(){
    console.log('listening on 3000');
})







