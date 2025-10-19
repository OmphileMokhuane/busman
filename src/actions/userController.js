"use server"
import { getCollection } from "../lib/db.js"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { redirect } from "next/navigation"

function isAlphaNumeric(str) {
    const regex = /^[a-zA-Z0-9]*$/
    return regex.test(str)
}

export const logout = async function() {
    const cookieStore = await cookies()
    cookieStore.delete("BmanApp")
    redirect("/login")
}

export const register = async function(prevState, formData) {
    const errors = {}
    const user = {
        username: formData.get("username"),
        password: formData.get("password"),
    }
    
    if (typeof user.username !== "string") user.username = ""
    if (typeof user.password !== "string") user.password = ""
    
    user.username = user.username.trim()
    user.password = user.password.trim()
    
    if (user.username.length < 3) errors.username = "Username must be at least 3 characters long"
    if (user.username.length > 30) errors.username = "Username must be less than 30 characters long"
    if (!isAlphaNumeric(user.username)) errors.username = "You can only use a-z, A-Z, 0-9 characters in your username"
    if (user.username == "") errors.username = "You must provide a username"
    
    // Check if user exists
    const userCollection = await getCollection("users")
    const userExists = await userCollection.findOne({ username: user.username })
    if (userExists) {
        errors.username = "Username is already taken"
    }
    
    if (user.password.length < 12) errors.password = "Password must be at least 12 characters long"
    if (user.password.length > 50) errors.password = "Password must be less than 50 characters long"
    if (user.password == "") errors.password = "You must provide a Password"
   
    if (errors.username || errors.password) {
        return {
            errors: errors,
            success: false
        }
    }
    
    // Hash user password
    const salt = bcrypt.genSaltSync(10)
    user.password = bcrypt.hashSync(user.password, salt)
    
    // Storing the new user in the database
    const newUser = await userCollection.insertOne(user)
    const userId = newUser.insertedId.toString()
    
    const ourTokenValue = jwt.sign({
        userId: userId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    }, process.env.JWT_SECRET)
    
    // Log the user in by giving them a cookie
    const cookieStore = await cookies()
    cookieStore.set("BmanApp", ourTokenValue, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        secure: true
    })
    
    // ✅ Redirect to dashboard after successful registration
    redirect("/")
}

export const login = async function(prevState, formData) {
    const failObject = {
        errors: {
            username: "Invalid username/password"
        },
        success: false
    }
    
    const ourUser = {
        username: formData.get("username"),
        password: formData.get("password"),
    }
    
    if (typeof ourUser.username !== "string") ourUser.username = ""
    if (typeof ourUser.password !== "string") ourUser.password = ""
    
    ourUser.username = ourUser.username.trim()
    ourUser.password = ourUser.password.trim()
    
    const collection = await getCollection("users")
    const user = await collection.findOne({ username: ourUser.username })
    
    if (!user) {
        return failObject
    }
    
    // ✅ Fixed typo: bcrypt (was bycrypt)
    const matchOrNot = bcrypt.compareSync(ourUser.password, user.password)
    
    if (!matchOrNot) {
        return failObject
    }
    
    // Create JWT token
    const ourTokenValue = jwt.sign({
        userId: user._id.toString(),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
    }, process.env.JWT_SECRET)
    
    // Log the user in by giving them a cookie
    const cookieStore = await cookies()
    cookieStore.set("BmanApp", ourTokenValue, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        secure: true
    })
    
    // ✅ Redirect to dashboard after successful login
    redirect("/")
}