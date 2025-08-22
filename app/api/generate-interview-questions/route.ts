import { NextRequest, NextResponse } from "next/server";
import Imagekit from "imagekit";
import axios from "axios";
var imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});
export async function POST(req: NextRequest){
    const formData = await req.formData();
const file = formData.get('file') as File;


    const bytes= await file.arrayBuffer();
    const buffer= Buffer.from(bytes);

    try{
   const uploadResponse= await imagekit.upload({
    file:buffer,
    fileName: Date.now().toString()+".pdf",
    isPublished: true
    });
 // call n8n
 const result =await axios.post("https://802150698d01.ngrok-free.app/webhook/0548f613-ceb0-409a-ab9a-ab5fa373f584", {
    resumeUrl:uploadResponse?.url
 });
 console.log(result.data)

    return NextResponse.json(uploadResponse.url);
}
    catch(error:any){
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}