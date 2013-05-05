var mongoose = require('mongoose');
var Schema = mongoose.Schema;

 // Comment - is an embedded document for blogSchema
var commentsSchema = new Schema({
    name      : String,
    text      : String,
    date      : { type: Date, default: Date.now }
    });

var blogSchema = new Schema({
    title     : String,
    urltitle  : String,
    body      : String,
    isCon     : Boolean,
    category  : String,
    address   : { type: Schema.Types.Mixed, ref: 'Address' },
    lastupdated : { type: Date, default: Date.now },
    comments : [commentsSchema],
    photos : [photoSchema],
    video : String,   
    user : { type: Schema.Types.ObjectId, ref: 'User' }
});

var addressSchema = new Schema({
    building   : String,
    apartment  : String, 
    city       : String,
    zip        : String
}); 

var photoSchema = new Schema({
    title     : String,
    urltitle  : String,
    caption   : String,
    image     : String,
    created : { type: Date, default: Date.now }
});

// export Page model
module.exports = mongoose.model('Address', addressSchema);
module.exports = mongoose.model('Photo', photoSchema);
module.exports = mongoose.model('Comment', commentsSchema); 
module.exports = mongoose.model('Blog', blogSchema);