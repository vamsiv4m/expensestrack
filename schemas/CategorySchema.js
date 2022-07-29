const mongoose = require("mongoose");
const expensecategory = mongoose.Schema([
    {
        value: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    }
]);
module.exports = mongoose.model("ExpenseCategory",expensecategory,"expensecategory");