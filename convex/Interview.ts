import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveInterviewQuestions = mutation({
  args: {
    questions: v.any(),
    uid: v.id("UserTable"),
    resumeUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const result= await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.questions,
      resumeUrl: args.resumeUrl,
      userId: args.uid,
      status: "draft",
    });
    return result;
  },
});
