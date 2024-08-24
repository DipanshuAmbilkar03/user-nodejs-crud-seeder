// ESM
// import { faker } from '@faker-js/faker' and CJS
const { faker } = require("@faker-js/faker");
const mysql =  require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override")

// 
app.use(methodOverride("_method"));
//  to parse the form data because patch request has been sent.
app.use(express.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.set("views" , path.join(__dirname, "/views"))

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "Your-Password",
});

// faker class : obj
// let createRandomUser = () => {
//     return {
//       userId: faker.string.uuid(),
//       username: faker.internet.userName(),
//       email: faker.internet.email(),
//       avatar: faker.image.avatar(),
//       password: faker.internet.password(),
//       birthdate: faker.date.birthdate(),
//       registeredAt: faker.date.past(),
//     };
// } 

let getRandomUser = () => {
    return {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
}

// user data route
app.get("/" , (req,res) => {
  // res.send("Welcome to Home page");
  let q = 'SELECT count(*) FROM user';
  // let q2 = 'SELECT count(*) FROM temp';
  try {
      connection.query(q, (err, result) => {
        if(err) throw err;
        let count = result[0]['count(*)'];
        res.render("home.ejs", {count});
      })
  } catch(err) {
      console.log("error found during process => " , err);
      // res.send("There are some error in page");
  }
});

// show route
app.get("/user", (req, res) => {
  q = `SELECT * FROM user`;

  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      // res.send(users);
      res.render("users.ejs" , {users});
    })
} catch(err) {
    console.log("error found during process => " , err);
}
})

app.get("/user/:id/edit" ,(req , res) => {
  let { id } = req.params;
  console.log(id);
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err , result) => {
      if (err) throw err;
      console.log(result);
      let user = result[0]; 
      res.render("edit.ejs" , {user});
    })
  }catch(err){
    console.log(err);
    res.send("there is an error on the Database.")
  }
  // res.render("edit.ejs");
});
// update route
app.patch("/user/:id" , (req , res) => {
    let { id } = req.params;
    let {password : formPass, username: newUsername} = req.body;
    console.log(id);
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
      connection.query(q, (err , result) => {
        if (err) throw err;
        let user = result[0]; 
        if(formPass != user.password) {
          res.send("Wrong Password")
        }else {
          let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`
          connection.query(q2,(err,result) => {
            if(err) throw err;
            res.redirect("/user");
          });
        }
      })
    }catch(err){
      console.log(err);
      res.send("there is an error on the Database.")
    }
})

app.listen("8080" , () => {
  console.log("'server is listening to port 8080'")
})