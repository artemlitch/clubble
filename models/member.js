var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MemberSchema = new Schema({
    name: {
        first: String,
        last: String,
    },
    email: { type: String, required: true, unique: true}, 
    password: { type: String, required: true }, 
    ownedClubs: [{ type: Schema.Types.ObjectId, ref :'Club'}],
    memberClubs: [{ type: Schema.Types.ObjectId, ref :'Club'}],
});

var Member = mongoose.model('Member', MemberSchema);
module.exports = Member;
