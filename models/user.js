const express = require("express");
/* MongoDB Connection Package  */
const mongoose = require("mongoose");

/* Define the user schema */
const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/* Auto Assignment of userId */
userSchema.pre("save", async function(next) {
    if (!this.userId) {
        try {
            const maxUserId = await User.findOne().sort({ userId: -1 }).select("userId");
            this.userId = maxUserId ? maxUserId.userId + 1 : 1;
        } catch (error) {
            console.warn("[ERROR] :", error);
            return next(error);
        }
    }
    next();
});

/* Create a virtual property for the full name */
userSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
});

/* Create the user model */
const User = mongoose.model("User", userSchema);

module.exports = User;