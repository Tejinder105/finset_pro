const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum:["salary", "investment", "rent", "transport", "shopping", "bills", "other","food"]
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true,
        enum: ["cash", "online", "card"]
    },
});

const Transaction = mongoose.model("Transaction", transactionsSchema);

module.exports = Transaction;