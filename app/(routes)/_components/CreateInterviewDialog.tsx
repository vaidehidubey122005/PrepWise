import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'
import axios from 'axios'
function CreateInterviewDialog(){
  const[formData,setFromData]=useState<any>();
  const[file, setFile]=useState<File|null>();
  const [loading, setLoading]=useState(false);
const onHandleInputChange=(field:string, value:string)=>{
    setFromData((prev:any)=>({
      ...prev,
      [field]:value
    }))
}

const onSubmit=async()=>{
  setLoading(true);
  if(!file) return;
  const formData=new FormData();
  formData.append('file', file);
  try{
     const res=await axios.post('/api/generate-interview-questions', formData)
     console.log(res.data);
  }
  catch(e){
    console.log(e);
  }
  finally{
    setLoading(false);
  }
}
  return (
    <Dialog>
  <DialogTrigger><Button>+ Create Interview</Button></DialogTrigger>
  <DialogContent className='min-w-3xl'>
    <DialogHeader>
      <DialogTitle>Please Submit following details </DialogTitle>
      <DialogDescription>
        <Tabs defaultValue="account" className="w-full mt-5">
  <TabsList>
    <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
    <TabsTrigger value="job-description">Job Description</TabsTrigger>
  </TabsList>
  <TabsContent value="resume-upload"><ResumeUpload setFiles={(file:File)=>setFile(file)}/></TabsContent>
  <TabsContent value="job-description"><JobDescription onHandleInputChange={onHandleInputChange}/></TabsContent>
</Tabs>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="flex-gap-6">
     <DialogClose>
      <Button variant={'ghost'}>Cancel</Button>
     </DialogClose>
      <Button onClick={onSubmit} disabled={loading || !file}>Submit</Button>

    </DialogFooter>
  </DialogContent>
</Dialog>

  )
}

export default CreateInterviewDialog