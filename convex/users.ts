import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser= mutation({
  args: {
    name:v.string(),
    email:v.string(),
    imageUrl:v.string(),
    },
    handler: async (ctx, args) => {
        //If user already exists, return
        const user =await ctx.db.query('UserTable').filter(q=>q.eq(q.field('email'), args.email)).collect();


        //If not then insert in database

        if(user.length === 0){
            const data={
                email:args.email,
                imageUrl:args?.imageUrl,
                name:args.name
            }
            const result= await ctx.db.insert('UserTable', {
               
                email: args.email,
                imageUrl: args?.imageUrl,
                 name: args.name
            });
            return {
                ...data,
                result
                //_id:result._if
            }
        }   
        return user[0];
    }
})