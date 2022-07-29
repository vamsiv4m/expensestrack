const mongoose = require("mongoose");
const expenseSchema = mongoose.Schema(
    [
        {
            userId: {
                type: String,
                required: true
            },
            expense_name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                required: true,
            },
            categoryIcon: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true
            }
        }
    ]);
module.exports = mongoose.model("ExpenseData", expenseSchema, "expensedata");