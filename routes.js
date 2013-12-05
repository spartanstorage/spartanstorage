var aws = require('./util/aws');
var user = require('./models/user');
var auth = require('./util/authorization');
var url = require('url');
var billing = require('./util/billing');

module.exports = function(app, passport){
    app.get("/", function(req, res){
            if(req.isAuthenticated()){
                aws.renderFileList(req,res);
            }
            else {
                res.render("login");
            }
    });
    
	app.get("/login", function(req, res){
            res.render("login");
            });
    
	app.post("/login"
             ,passport.authenticate('local',{
                                    successRedirect : "/",
                                    failureRedirect : "/login",
                                    })
             );
    
    
    app.get("/signup", function (req, res) {
            res.render("signup");
            });
    
	app.post("/signup", auth.userExist, function (req, res, next) {
             user.signup( req.body.firstname, req.body.lastname, req.body.email,
                          req.body.password, req.activationkey, function(err, user){
                         if(err) throw err;
                         req.login(user, function(err){
                                   if(err) return next(err);
                                   return res.redirect("/");
                                   });
                         });
             });
	    
	app.get("/logout", function(req, res){
            req.logout();
            res.redirect("/login");
            });

    app.post("/upload", function(req, res) {
             if(req.isAuthenticated()){
                aws.putObject(req.files.myfile, req,  res);
             }
             else {
                res.render("login");
             }
    });
    
    app.get("/download", function(req, res){
            if(req.isAuthenticated()){
                var url_parts = url.parse(req.url, true);
                var query = url_parts.query;
                aws.getObject(req, res, query["key"]);
            }
            else {
                res.render("login");
            }
    });
    
    app.del("/delete", function(req, res){     
            if(req.isAuthenticated()){
                var url_parts = url.parse(req.url, true);
                var query = url_parts.query;
                aws.deleteObject(req, res, query["key"]);
            }
            else {
                res.render("login");
            }
    });
    
    app.get("/billing", function(req, res){
            if(req.isAuthenticated()){
                billing.generateBill(req, res);
            }
            else {
                res.render("login");
            }
    });
    
    
}