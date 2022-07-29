const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema(
    [
        {
            username: {
                type: String,
                required: true,
                unique: true
            },
            email: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            cpassword: {
                type: String,
                required: true
            },
            tokens: [
                {
                    token: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
    ]
);

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ userId: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (e) {
        console.log(e.message);
    }
}

module.exports = mongoose.model("UserData", userSchema, "userdata");