var moment = require('moment');

var Blog = require('../models/blog.js');
var User = require('../models/user.js'); 
var Comment = require('../models/blog.js');
var Photo = require('../models/blog.js');
var Address = require('../models/blog.js');

var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var s3 = new AWS.S3();

exports.index = function(req,res){

  var query = User.find({});
  
  query.exec(function(err, user){

    if (err) {
      res.send("uhoh, something happened.");

    } else {

      var template_data = {
        
        currentUser : req.user

      };

      res.render('index.html', template_data);
    }
    
  });
}; 

exports.view =  function(req,res){

  var query = Blog.find({});
  query.populate('user');
  query.sort('-lastupdated');
  query.exec(function(err, posts){

    if (err) {
      res.send("uhoh, something happened when getting blog posts.");

    } else {

      //loop through all posts
      for ( i=0; i < posts.length; i++){

        var currPost = posts[i]; //get current post using i iterator/index

        //add new property commentCount set equal to length of comment array
        currPost.commentCount = currPost.comments.length; 
        // add property "intro"
        currPost.intro = currPost.body.substring(0,100)+" ..."; 
        console.log("intro: "+currPost.intro); 
      }
  
      var template_data = {
        
        posts : posts, 
        currentUser : req.user
      };

      res.render('view.html', template_data);
    }
    
  });
  
};

exports.filtered_posts = function(req,res) 
{
  console.log(req.body); 
  var blogQuery;

  if(req.body.category != "all"){

    blogQuery = Blog.find({ 
 
     $and: [ 
      { 'category': req.body.category },
      {'address.building' : req.body.building.toLowerCase()},
      //{ apartment: req.body.apartment },
      {'address.city' : req.body.city.toLowerCase()}
      //{ zip: req.body.zip }
      ]

      });
  }  
  else {

    blogQuery = Blog.find({ 
 
     $and: [ 
      {'address.building' : req.body.building.toLowerCase()},
      //{ apartment: req.body.apartment },
      {'address.city' : req.body.city.toLowerCase()}
      //{ zip: req.body.zip }
      ]

      });
  } 
   
    var matches; 
    var greeting; 

  blogQuery.exec(function(err, posts)

    {
    if (err) 
    {
      res.send('error');
    }

    else if (!posts) 
    {
      res.send('unable to find any posts');  
    } 
    else  // if posts exist render the page with those posts
    {
      console.log(posts); 

    for(i=0; i < posts.length; i++) {

      if (posts[i].address.apartment == req.body.apartment.toLowerCase()) 
      {
        console.log("exact match was found: " + posts[i]); 
        greeting="exact match was found: "; 
        matches = posts[i]; 
      } 
      else 
      {
        console.log("no exact match"); 
        greeting = "building matches found: "; 
        matches = posts[i]; 
      }
    } // close "for loop"; 

    var template_data = {
            title : greeting,
            posts : matches,
            bloguser : req.user,
            currentUser : req.user    
          };

  res.render('category_posts.html', template_data);
      
    } // else - if posts exist render the page with those posts
  }); // blogQuery.exec(function(err, posts)
}; // exports.filtered_posts = function(req,res){


exports.category_posts = function(req, res) {  

  var blogQuery = Blog.find({ 

      category:req.body.category} );

      blogQuery.sort('-lastupdated');
      blogQuery.exec(function(err, posts_by_category) {

    if (err) {
      res.send('unable to find any posts');

    } else {

            var template_data = {
            title : req.body.category + " Category Blog Posts",
            posts : posts_by_category,
            bloguser : req.user,
            currentUser : req.user
            
          };

          res.render('category_posts.html', template_data);
    }

  })
  
};

exports.getSinglePost = function(req,res) {

  var query = Blog.findById(req.param('blog_id'));
  query.populate('user');
  query.exec(function(err, blogpost){

      if (err) {
        
        res.send("Uhoh something went wrong");
        console.log(err);

      } else {
        
        console.log("***********");
        var currentUser = req.user; 
        console.log("Current user: " + req.user);
        console.log("***********");
        
        var template_data = {
          blogPostTitle: blogpost.title,
          category: blogpost.category,
          user : blogpost.user,
          body : blogpost.body,
          id : blogpost.id,
          comments : blogpost.comments,
          currentUser : req.user,
          blogpost : blogpost
        };
        console.log(blogpost.id);
        res.render('single_blog_post.html', template_data);
      } 
    });
};

exports.postComment = function(req,res){

  console.log("blog id: " + req.param('blog_id'));

  Blog.findById(req.param('blog_id'), function(err, blogpost){


        if (err) {
          res.send("unable to find the note");
        } 

        var name = req.body.name; 
        var text = req.body.text; 

        console.log(name);
        console.log(text);

        var commentData = {
                name : name,
                text : text
            };

        // append the comment to the comment list
        blogpost.comments.push(commentData);
        blogpost.save();

                res.redirect('/get_single_post/' + blogpost.id);

        });
};

exports.user_posts = function(req, res) {

  var username = req.param('username');

  console.log("got from layout currentUser.username: "+username); 

// we find documnet User with the use name = username

  var userQuery = User.findOne({username:req.param('username')});
  userQuery.exec(function(err, user) {

    if (err) {
      res.send('unable to find user');

    } else {

     /* user.formattedMoveInDate = function() {
            return moment(this.dateMovedIn).format("dddd, MMMM Do YYYY");
        };*/
    
    // now we have info about that entire User document
    // including user.id
    // so now we can find document Blog that, in its "user" field
    // has the same user.id as out User document

      var query = Blog.find({user:user.id});
      query.sort('-lastupdated');
      query.exec(function(err, blogposts){

        if (err) {
          res.send("uhoh, something happened when getting blog posts.");

        } else {

          // transform dates into display format
          var tempDateIn = moment(user.dateMovedIn);
          var formattedDateIn = tempDateIn.format("YYYY-MM-DD");
          var tempDateOut = moment(user.dateMovedOut);
          var formattedDateOut = tempDateOut.format("YYYY-MM-DD");

          var tempLastUpdated = moment(blogposts.lastupdated);
          var formattedlastupdated = tempLastUpdated.format("YYYY-MM-DD");

          var template_data = {

            username : user.username,
            email : user.email,
            address : user.address,
            dateMovedIn: formattedDateIn, 
            dateMovedOut: formattedDateOut,
            title : user.username + "'s Account",
            posts : blogposts, 
            lastupdated : formattedlastupdated,
            currentUser : user,
            user_id : user.id

          };
          
          // if logged in, is this user the requested user?
          if (req.user != undefined){
            template_data.isOwner = (req.user.id == user.id)
          }

          res.render('user_posts.html', template_data);
        }
        
      });

    }

  })
  
}

var cleanBuilding = function(building) {
    
    var s = building;
    var punctuationless = s.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    return finalString = punctuationless.replace(/\s{2,}/g," ").toLowerCase();
    
}

var cleanFileName = function(filename) {
    console.log(filename);
    fileParts = filename.split(".");
    
    //get the file extension
    fileExtension = fileParts[fileParts.length-1]; //get last part of file
    
    //add time string to make filename a little more random
    d = new Date();
    timeStr = d.getTime();
    
    //name without extension "My Pet Dog"
    newFileName = fileParts[0];
    
    return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;
    
}

// controller for individual note view
exports.write = function(req, res){
  
  var template_data = {
    title : 'Create a New Post',
    currentUser : req.user,
    blogpost : req.user,
    isCon: true
  };

  res.render('blog_form.html', template_data)
};

exports.write_post = function(req, res){

  console.log("isCon value: " + req.body.isCon); 

  var building = req.body.building;
  var cleanedBuilding = cleanBuilding(building);
  var blogID = req.param.blog_id;

  if(blogID) {
    Blog.findById(blogID, function(err, blogpost){

        if (err) {
          res.send("unable to find the note");
        }

        blogpost.title = req.body.title;
        blogpost.body = req.body.body;
        blogpost.isCon = function () {
          if (req.body.isCon !== "undefined") {
            return true;
          } else {
            return false;
          }
        };
        blogpost.category = req.body.category;
        blogpost.address.building = cleanedBuilding;
        blogpost.address.apartment = req.body.apartment.toLowerCase();
        blogpost.address.city = req.body.city.toLowerCase();
        blogpost.address.zip = req.body.zip.toLowerCase(); 
        blogpost.video = req.body.video;
        blogpost.save(); 
        res.redirect('/edit/'+blogpost.id);

      });
  }
  else {

    // Create a new blog post
    var blogpost = new Blog(); // create Blog object
    blogpost.title = req.body.title;
    blogpost.urltitle = req.body.title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')
    blogpost.body = req.body.body;
    blogpost.isCon = req.body.isCon;
    blogpost.category = req.body.category; 

    blogpost.address = {
        building : cleanedBuilding,
        apartment : req.body.apartment.toLowerCase(),
        city : req.body.city.toLowerCase(),
        zip : req.body.zip.toLowerCase() 
    }
    
    blogpost.user = req.user; 


    var filename = req.files.image.filename; // filename of file on mAc
    var path = req.files.image.path; //will be put into a temp directory
    var mimeType = req.files.image.type; // image/jpeg or actual mime type

    // 2) create file name with logged in user id 
    // + cleaned up existing file name. function defined above.
    var cleanedFileName = cleanFileName(filename);

    // 3a) We first need to open and read the image upload into a buffer
    fs.readFile(path, function(err, file_buffer){

    // pick the Amazon S3 Bucket
    var s3bucket = new AWS.S3({params: {Bucket: 'rentorvent'}});

    var params = {
      Key: cleanedFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: mimeType
    };
     
    // Put the Object in the Bucket
    s3bucket.putObject(params, function(err, data) {
      if (err) {

        console.log(err)

      } else {
        console.log("Successfully uploaded data to s3 bucket");
        image = cleanedFileName;
      }

    // Create a new photo container for the photo to store in Mongo DB

    var photoData = {
                title     : req.body.image_title,
                urltitle  : req.body.image_title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_'),
                caption   : req.body.image_caption,
                image     : image
            };

      blogpost.photos.push(photoData);
      blogpost.video = req.body.video;
      blogpost.save(); 
      res.redirect('/edit/'+blogpost.id);

    });

  });
    
  }

};

exports.deleteImage= function(req,res){

  Blog.findById(req.param('blog_id'), function(err, blogpost){

    var imagetobeDeleted = req.params.imagefileName;

    if(err){

      console.log("error getting image name and blog id"); 

    } else {

      s3.client.deleteObject({Bucket: 'rentorvent', Key : imagetobeDeleted}, function(err,data){
        
        console.log(data);

          for(i=0;i<blogpost.photos.length;i++){
            if(blogpost.photos[i].image==imagetobeDeleted){
            positionofImage=i;
        }
  }
    blogpost.photos.splice(positionofImage,1);

    blogpost.save(); 

            res.redirect('/edit/'+blogpost.id);
    });
  
  }

});

};

exports.edit = function(req,res) {
    
    console.log(req.param('blog_id'));

    Blog.findById(req.param('blog_id'), function(err, blogpost){

      if (err) {
        
        res.send("Uhoh something went wrong");
        console.log(err);

      } else if (blogpost.user != req.user.id){

        res.send('You do not own this blog post.');
      
      } else {

        
        var template_data = {
          title : 'Edit Blog Post',
          blogpost : blogpost,
          isCon : blogpost.isCon,
          currentUser : req.user
        };

        res.render('blog_form.html', template_data);
      } 

    });

};

