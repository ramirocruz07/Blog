import z from "zod"

export const signupInput=z.object({
  username:z.string().email(),
  password:z.string().min(5),
  name:z.string().optional()
})
export type SignupInput=z.infer<typeof signupInput>

export const signinInput=z.object({
    username:z.string().email(),
    password:z.string().min(5)
  })
export type SigninInput=z.infer<typeof signinInput>





export const  createBloginput=z.object({
    title:z.string(),
    content:z.string()
})
export type CreateBloginput=z.infer<typeof signupInput>
export const  updateBloginput=z.object({
    title:z.string(),
    content:z.string(),
    id:z.number()
})

export type UpdateBloginput =z.infer<typeof updateBloginput>