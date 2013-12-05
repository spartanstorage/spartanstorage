var mongoose = require('mongoose');
FileSchema = mongoose.Schema({
                             ownerEmail:  String,
                             key: String,
                             size:   Number,
                             createdDate:  { type : Date, default: Date.now }
                             });

var File = mongoose.model("File", FileSchema);
module.exports = File;