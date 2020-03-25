var bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  expressSanitizer = require("express-sanitizer"),
  methodOverride = require("method-override"),
  express = require("express"),
  app = express();

// mongoose.connect("mongodb://localhost/restful_blog_app", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false
// });
mongoose.connect("mongodb+srv://dpak:@dpaknitw@blogcluster-lvcls.mongodb.net/test?retryWrites=true&w=majority",{
	useNewUrlParser: true,
     useUnifiedTopology: true
});
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  // type:String,default:"placeholderimage.jpg"
  body: String,
  created: {
    type: Date,
    default: Date.now
  }
});
var Blog = mongoose.model("Blog", blogSchema);

var UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

UserSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", UserSchema);

app.use(
  require("express-session")({
    secret: "i am learning web dev using node js express",
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.get("/", function(req, res) {
  res.redirect("/blogs");
});
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) console.log(err);
    else {
      res.render("index", { blogs: blogs });
    }
  });
});
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

app.post("/blogs", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);

  Blog.create(req.body.blog, function(err, blog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.render("login");
}
app.get("/blogs/:id/edit", isLoggedIn, function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});
app.put("/blogs/:id", function(req, res) {
  console.log(req.body.blog.body);
  req.body.blog.body = req.sanitize(req.body.blog.body);
  console.log(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    foundBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});
function isLogged(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.render("login");
}
app.delete("/blogs/:id", isLoggedIn, function(req, res) {
  Blog.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) {
      res.send("There was a problem deleting the blog");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function(err, user) {
      if (err) {
        console.log(err);
        return res.render("register");
      }
      passport.authenticate("local")(req, res, function() {
        res.redirect("/blogs");
      });
    }
  );
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(8000, function() {
  console.log("server is running");
});
