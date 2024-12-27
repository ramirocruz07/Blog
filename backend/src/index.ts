import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate' 
import { Bindings } from 'hono/types'
import {decode,jwt,sign,verify} from 'hono/jwt'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'
import { cors } from 'hono/cors'

type Enviroment={
  Bindings:{
    DATABASE_URL:string
    JWT_SECRET:string
  },
  Variables:{
    prisma:any
  }
}
const app = new Hono<Enviroment> ()
app.use('/*', cors())

app.route("/api/v1/user",userRouter)
app.route("/api/v1/blog",blogRouter)

app.use('*',async(c,next)=>{
  const prisma=new PrismaClient({
    datasources:{
      db:{
        url:c.env.DATABASE_URL
      },
    },
  }).$extends(withAccelerate())
  c.set('prisma',prisma)
  await next()
})

app.use('api/v1/blog/*',async(c,next)=>{
  const header=c.req.header("authorization")|| ""
  const token =header.split("")[1] 
  //@ts-ignore
   const response=await verify(token,c.env.JWT_SECRET)
   if(response.id){
    next()   }
    else{
      c.status(403)
      return c.json({
        error:"unauthorized"
      })
    }


})


app.post('api/v1/blog', async (c) => {
  return c.text('Hello Hono!')
})

app.post('api/v1/signup',async(c)=>{
  const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json()
  try{
 const user= await prisma.user.create({
    data:{
      email:body.email,
      password:body.password,
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

app.post('api/v1/signin',async(c)=>{
  const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json()
  try{
 const user= await prisma.user.findFirst({
    where:{
      email:body.email,
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

app.put('api/v1/blog',(c)=>{
  return c.text('WOW')
})

app.get('api/v1/blog',(c)=>{
  return c.text('WOW')
})

export default app
