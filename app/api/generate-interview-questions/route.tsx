import { NextResponse, NextRequest } from "next/server";
import ImageKit from "imagekit";
import axios from "axios";
import { aj } from "@/utils/arcjet";
import { currentUser } from "@clerk/nextjs/server";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(req: NextRequest) {
  try {
    const user=await currentUser();
    const formData = await req.formData();
    const file = formData.get("file");
    const jobTitle = formData.get("jobTitle") as string | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    const decision= await aj.protect(req,{ userId:user?.primaryEmailAddress?.emailAddress??'' , requested:5});
    console.log("Arcjet decision", decision);
    
    //@ts-ignore
    if(decision?.reason?.remaining==0){
      return NextResponse.json({
        status:429,
        result:'No free credit remaining, Try again after 24 Hours'
      })
    }

    if (file && typeof file !== "string") {
      const uploadedFile = file as File;
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `upload-${Date.now()}.pdf`,
        isPrivateFile: false,
        useUniqueFileName: true,
      });

      // call n8n with resume
      const result = await axios.post(
        "http://localhost:5678/webhook/generate-interview-questions",
        {
          resumeUrl: uploadResponse?.url,
        }
      );

      return NextResponse.json({
        questions: result.data?.content?.parts?.[0]?.text,
        resumeUrl: uploadResponse?.url,
        status: 200
      });
    } else {
      // call n8n with job title + description
      const result = await axios.post(
        "http://localhost:5678/webhook/generate-interview-questions",
        {
          jobTitle: jobTitle ?? "",
          jobDescription: jobDescription ?? "",
        }
      );

      return NextResponse.json({
        questions: result.data?.content?.parts?.[0]?.text,
        resumeUrl: "", 

      });
    }
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
