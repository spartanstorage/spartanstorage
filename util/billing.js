var Tracker = mongoose.model('Tracker');
var File = mongoose.model('File');
var async = require('async');

var STORAGE_RATE = 0.095;
var ACCESS_RATE = 0.045/1000;
var DATA_IN_RATE = 0;
var DATA_OUT_RATE = 0.12;

var currDate = new Date();
var startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
var endDate = new Date(currDate.getFullYear(), currDate.getMonth()+1, 0);

exports.generateBill = function (req, response) {    
    async.parallel(
    { 
       accessCount: function(callback){
       Tracker.count({ ownerEmail:req.user.email, accessDate: { $gte: startDate, $lte: endDate }},
             function (err, accessCount) {
             callback(null, accessCount);
             });
       },
       files: function(callback){
       File.find({ ownerEmail:req.user.email, createdDate: { $gte: startDate, $lte: endDate }},
             function (err, docs) {
             callback(null,docs);
             });
       },
       deleteTrackers: function(callback){
       Tracker.find({ ownerEmail:req.user.email, state:"DELETE" , accessDate: { $gte: startDate, $lte: endDate }},
             function (err, docs) {
             callback(null,docs);       
             });
       },
       getTrackers: function(callback){
       Tracker.find({ ownerEmail:req.user.email, state:"GET" , accessDate: { $gte: startDate, $lte: endDate }},
             function (err, docs) {
             callback(null,docs);       
             });
       }
    },
       function(err, result){
            if (err) throw err;
            calcBill(response,result);
       }
    );
}

function getFileSize(files, filename) {
    for (var i = 0; i < files.length; i++) {
        if (files[i].key===filename)
            return files[i].size;
    }
    return 0;
}




function calcBill(response,result) {
    var dataPUTS=0;
    var dataGETS=0;
    var dataDELETES=0;
    var dataTransferIn=0;
    var dataTransferOut=0;
    
    for (var i = 0; i < result.files.length; i++) {
        // calculate the time till the end of the current month
        var timeStored = endDate.getTime()-result.files[i].createdDate.getTime();
        dataPUTS+=(timeStored*result.files[i].size);
        // convert to GB
        dataTransferIn+=result.files[i].size/1073741824;
    }
    
    for (var i = 0; i < result.deleteTrackers.length; i++) {
        // calculate the time till the end of the current month
        var fileSize = getFileSize(result.files,result.deleteTrackers[i].key);
        var timeStored = endDate.getTime()-result.deleteTrackers[i].accessDate.getTime();
        dataDELETES+=(timeStored*fileSize);
    }
    
    for (var i = 0; i < result.getTrackers.length; i++) {
        // calculate the time till the end of the current month
        var fileSize = getFileSize(result.files,result.getTrackers[i].key);
        var timeStored = endDate.getTime()-result.getTrackers[i].accessDate.getTime();
        dataGETS+=(timeStored*fileSize);
        // convert to GB
        dataTransferOut+=fileSize/1073741824;
    }
    
    // convert from byte-ms to GB-month
    var storage = (dataTransferPUTS - dataTransferDELETES)/(1073741824*2.62974e9);
    
    var storageCost = STORAGE_RATE*storage;
    var accessCost = ACCESS_RATE * result.accessCount;
    var dataInCost = DATA_IN_RATE * dataTransferIn;
    var dataOutCost = DATA_OUT_RATE * dataTransferOut;
    var totalCost = storageCost + accessCost + dataInCost  + dataOutCost;
    response.render("billing",
                    {accessCount:result.accessCount, storage:storage, dataTransferIn:dataTransferIn, dataTransferOut:dataTransferOut,
                    totalCost:totalCost, storageCost:storageCost, accessCost:accessCost, dataInCost:dataInCost, dataOutCost:dataOutCost });
}
