var mongoose = require('mongoose');
var states = 'GET DELETE LIST'.split(' ')
TrackerSchema = mongoose.Schema({
                             ownerEmail:  String,
                             key:   String,
                             state: { type: String, enum: states },
                             accessDate:  { type : Date, default: Date.now }
                             });

var Tracker = mongoose.model("Tracker", TrackerSchema);
module.exports = Tracker;