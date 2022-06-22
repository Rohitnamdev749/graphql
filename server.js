import { ApolloServer , gql} from "apollo-server";
import {ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import jwt from "jsonwebtoken";
import typeDefs from "./schemaGql.js";


import mongoose from "mongoose";
import { JWT_SECRET_KEY, MONGO_URI } from "./config.js";
// mongodb atlas connection here done
mongoose.connect(MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected',()=>{
    console.log("mongoo connection successfully don")
})

mongoose.connection.on('error',(err)=>{
    console.log("mongoo connection failed",err)
})

// import models here
// import './models/User';
import './models/User.js';
import './models/Quotes.js';

import resolvers from "./resolvers.js";

// This is middleware
const context = ({req})=>{
    const {authorization} = req.headers
    if(authorization){
       const {userId} =  jwt.verify(authorization, JWT_SECRET_KEY)
       console.log("userid",userId)
        return {userId}
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    plugins:[
        ApolloServerPluginLandingPageGraphQLPlayground()
    ]
})

server.listen().then(({url})=>{
    console.log("server ready for launch",url)
})