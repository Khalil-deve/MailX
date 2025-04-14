const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    emailToken: String,
    emailTokenExpire: Date
});

// Passport authentication using emails instead of username
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });


let User = mongoose.model("User", UserSchema);
module.exports = User;