var bodyParser=require('body-parser'),
	mongoose=require('mongoose'),
	expressSanitizer=require('express-sanitizer'),
	methodOverride=require('method-override'),
	express=require('express'),
	app=express();


mongoose.connect("mongodb://localhost/restful_blog_app",{ useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify:false});
app.use(express.static("public"));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

var blogSchema=new mongoose.Schema({
	title:String,
    image:String,
    // type:String,default:"placeholderimage.jpg"
	body:String,
	created:
	   {
			type:Date,
			default:Date.now
		}
});
var Blog=mongoose.model("Blog",blogSchema);
app.get("/",function(req,res){
	res.redirect("/blogs");
});
app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err) console.log(err);
		else{
			res.render("index",{blogs:blogs});
		}
	});
});
app.get("/blogs/new",function(req,res){
	res.render("new");
});

app.post("/blogs",function(req,res){
	
	req.body.blog.body=req.sanitize(req.body.blog.body);

	Blog.create(req.body.blog,function(err,blog){
		if(err){
			res.render("new");
		}
		else{
			res.redirect("/blogs");
		}
	})
});
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show",{blog:foundBlog});
		}
	});
});
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit",{blog:foundBlog});
		}
	});
});
app.put("/blogs/:id",function(req,res){
	console.log(req.body.blog.body);
	req.body.blog.body=req.sanitize(req.body.blog.body);
	console.log(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err,user){
		if(err){
			res.send("There was a problem deleting the blog");
		}
		else{
			res.redirect("/blogs");
		}
	})
})

app.listen(8000,function(){
	console.log("server is running");
});