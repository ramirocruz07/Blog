import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate' 
import { Bindings } from 'hono/types'
import {decode,jwt,sign,verify} from 'hono/jwt'
import z from "zod"
import { signupInput, SignupInput } from "@ramirocruz/medium-common";

export const userRouter= new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string;
    }
}>()

userRouter.post('/signup',async(c)=>{
  const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json()
  const {success}=signupInput.safeParse(body)
  if (!success){
    c.status(411)
    return c.json({
      message:"inputs not correct"
    })
  }
    try{
 const user= await prisma.user.create({
    data:{
      email:body.username,
      password:body.password,
      name:body.name,
    }
  })
  //@ts-ignore
  const token =await sign({id:user.id},c.env.JWT_SECRET)
  return c.json({
    jwt:token
  })}catch(e){
    console.log(e)
    c.status(411)
    return c.text('Invalid')
  }
})

userRouter.post('/signin',async(c)=>{
  const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json()
  try{
 const user= await prisma.user.findFirst({
    where:{
      email:body.username,
      password:body.password,
    }
  })
  if(!user){
    c.status(403)
    return c.json({
      message:"incorrect credentials"
    })
  }
  //@ts-ignore
  const token =await sign({id:user.id},c.env.JWT_SECRET)
  return c.json({
    jwt:token
  })}catch(e){
    console.log(e)
    c.status(411)
    return c.text('Invalid')
  }
})
