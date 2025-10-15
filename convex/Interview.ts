import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveInterviewQuestions = mutation({
  args: {
    questions: v.optional(v.any()),
    uid: v.id("UserTable"),
    resumeUrl: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    
     const result=await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.questions,
      resumeUrl: args.resumeUrl,
      userId: args.uid,
      status: "draft",
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription
    });
    return result;
  },
});

export const GetInterviewQuestions = query({
  args:{
  interviewRecordId:v.id('InterviewSessionTable'),
  },
  handler: async(ctx, args)=>{
    const result=await ctx.db.query('InterviewSessionTable')
    .filter(q=>q.eq(q.field('_id'), args.interviewRecordId))
    .collect();
    return result[0];
  }

})