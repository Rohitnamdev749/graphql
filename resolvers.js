import {users , quotes} from './fakedb.js';
import {randomBytes} from "crypto";
import bcrypt from "bcryptjs"
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from './config.js';
const User = mongoose.model("User");
const Quotes = mongoose.model("Quotes")

const resolvers = {
    Query :{
        users:async()=> await User.find({}) ,
        // when any query haven't parent so, it's first argument come undefined and in second argument come pass data
        user:async(_, {_id})=>   await User.findOne({_id}),//users.find(user=> user.id == id),
        quotes:async ()=> await Quotes.find({}).populate("by","_id firstName"),//quotes,
        userquote : async (_,{by})=> await Quotes.find({by}),//quotes.filter(quote=> quote.by == by)
        myprofile : async (_,args,{userId})=> {
            if(!userId) throw new Error("You must be logged in")
            return await User.findOne({_id : userId})}
    },
    User : {
        // ur is a User because it's parent of quotes
        quotes:async(ur)=> Quotes.find({ by : ur._id})//quotes.filter(quote=>quote.by == ur.id)
    },
    // mutation create for singup
    Mutation:{
        signupUser:async(_,{userNew})=>{

            const user = await User.findOne({ email : userNew.email})
            if(user){
                throw new Error("User already exists with that email address");
            }
            const hashedPassword = await bcrypt.hash(userNew.password, 12)

            const newUser = new User({
                ...userNew,
                password : hashedPassword
            })
            return await newUser.save()
            // const id = randomBytes(5).toString("hex")

            // users.push({
            //     id,
            //     ...userNew
            // })

            // return users.find(user=>user.id == id)
        },
        signinUser:async(_,{userSignin})=>{
            const user = await User.findOne({email : userSignin.email})

            if(!user){
                throw new Error("user doesn't exits with that email");
            }
            const doMatch = await bcrypt.compare(userSignin.password, user.password)
            if(!doMatch){
                throw new Error("Email or Password is invalid");
            }            

            const token = jwt.sign({userId : user._id},JWT_SECRET_KEY)
            return  {token} 
        },
        // 3rd parameter for context but we destructured userId
        createQuotes:async (_,{name},{userId})=>{
            console.log("resolver userid",userId)
            if(!userId) throw new Error("you must be logged in")
            const newQuote =  new Quotes({
                name,
                by:userId
            })
            await newQuote.save()
            return "Quote saved successfully"
        }

    }
}

export default resolvers;
