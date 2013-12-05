var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/config.json');
var s3 = new AWS.S3();
var fs = require('fs');
var fileModel = require('../models/file');
var tracker = require('../models/tracker');


function getBucketName(email) {
    var bucketNamePrefix='SPARTAN_STORAGE_';
    return bucketNamePrefix+email.replace('@','');
}
    
exports.renderFileList = function (req, res) {
    var bucketName = getBucketName(req.user.email);
    var request = s3.listObjects({'Bucket':bucketName});
	request.httpRequest.headers['x-amz-security-token'] = req.user.userToken;
	request.send(
         function (err, data) {
             if (err) throw err;
             tracker.create({
                            ownerEmail : req.user.email,
                            key : null,
                            state : "LIST"
                            });

             res.render("index", {"user":req.user,"files":data.Contents});
             }
    );
}

exports.createBucket = function (user, done ) {
	var request = s3.createBucket({Bucket:getBucketName(user.email)});
	request.httpRequest.headers['x-amz-security-token'] = user.userToken;
	request.send(function(err,data){
                    if (err) throw err;
                    done(null, user);
                 } );
}

exports.putObject = function (file, req, res) {
    fs.stat(file.path, function (err, stats) {
        if (err) throw err;
        fs.readFile(file.path, function (err, data) {
            if (err) throw err;
            var request = s3.putObject({ Bucket: getBucketName(req.user.email),
                                       Key: file.name,
                                       Body: data,
                                       ContentType: file.type
                                       });
            request.httpRequest.headers['x-amz-security-token'] = req.user.userToken;
            request.send(function(err,data){
                         if (err) throw err;
                         
                         fileModel.create({
                                          ownerEmail : req.user.email,
                                          key : file.name,
                                          size : stats.size
                                          });
                         res.redirect("/");
                         });
            }
        );
    });
    
    
    
}

exports.getObject = function (req, res, key) {
	 var request = s3.getObject({"Bucket":getBucketName(req.user.email),"Key":key});
	 request.httpRequest.headers['x-amz-security-token'] = req.user.userToken;
     request.send(function(err,data){
     if (err) throw err;
     var fileName = '/tmp/'+key;
     fs.writeFile(fileName, data.Body,
          function (err) {
              if (err) throw err;
              tracker.create({
                             ownerEmail : req.user.email,
                             key : key,
                             state : "GET"
                             });
              res.cookie('fileDownload', 'true', { path: '/' });    
              res.download(fileName,key);
              });
     });
}

exports.deleteObject = function (req, res, key) {
    var request = s3.deleteObject({"Bucket":getBucketName(req.user.email),"Key":key});
    request.httpRequest.headers['x-amz-security-token'] = req.user.userToken;
    request.send(function(err,data){
                     if (err) throw err;
                      tracker.create({
                                ownerEmail : req.user.email,
                                key : key,
                                state : "DELETE"
                                });
                     res.send(200);
                 });
}
