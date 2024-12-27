
import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import { validator } from "hono/validator";
import z from "zod"
import { createBloginput, updateBloginput } from "@ramirocruz/medium-common";

export const blogRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string;
    },
    Variables:{
      userId: string
    }
}>()

blogRouter.use('/*',async(c,next)=>{
  const authheader=c.req.header("authorization")|| ""
  try{const user= await verify(authheader,c.env.JWT_SECRET)
  if (user){
    c.set('userId',user.id)
    await next()
  }
  else{
    c.status(403)
    return c.json({
      message:"you are not logged in"
    })
  }
  }catch(e){
    c.status(403)
    return c.json({
      message:"error logging in"
    })
  }

})


blogRouter.post('/', async (c) => {
 const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json()
  const {success}=createBloginput.safeParse(body)
  if (!success){
    c.status(411)
    return c.json({
      message:"inputs not correct"
    })
  }
  const authorId=c.get("userId")
  const blog =await prisma.blog.create({
    data:{
        title:body.title,
        content:body.content,
        authorId:Number(authorId)
    }
  

  })
  return c.json({
    id:blog.id
  })
})

blogRouter.put('/',async(c)=>{
  const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const body=await c.req.json()
  const {success}=updateBloginput.safeParse(body)
  if (!success){
    c.status(411)
    return c.json({
      message:"inputs not coreect"
    })
  }
  try{
    const blog =await prisma.blog.update({
    where:{
      id:body.id
    },
    data:{
        title:body.title,
        content:body.content,
        authorId:1
    }
  })
  return c.json({
    id:blog.id
  })}catch(e){
    c.status(411)
    return c.json({
    msg:"error updating"
    })
  }
  })
  

  blogRouter.get('/bulk',async(c)=>{
    const prisma= new PrismaClient({
      //@ts-ignore
      datasourceUrl:c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs=await prisma.blog.findMany({
      select:{
        content:true,
        title:true,
        id:true,
        author:{
          select:{
            name:true
          }
        }
      }
    })
    return c.json({
      blogs  
    })
  })

blogRouter.get('/:id',async(c)=>{

  const prisma= new PrismaClient({
    //@ts-ignore
    datasourceUrl:c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  const id= c.req.param("id")
      
  try{
    const blog =await prisma.blog.findFirst({
    where:{
      id:Number(id)
    },
    select:{
      id:true,
      title:true,
      content:true,
      author:{
        select:{
          name:true
        }
      }
    }
  })
  return c.json({
    blog
  })}catch(e){
    c.status(411)
    return c.json({
    msg:"error fetching"
    })
  }
  })

  blogRouter.get('/bulk',async(c)=>{
    const prisma= new PrismaClient({
      //@ts-ignore
      datasourceUrl:c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs=await prisma.blog.findMany()
    return c.json({
      blogs  
    })
  })