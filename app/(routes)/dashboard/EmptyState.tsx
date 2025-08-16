import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import CreateInterviewDialog from '../_components/CreateInterviewDialog';

const EmptyState = () => {
  return (
    <div className="mt-14 flex flex-col items-center gap-5 border-dashed p-10 border-2 rounded-2xl bg-gray-50">
      <Image
        src="/interview.png"
        alt="emptyState"
        width={130}
        height={130}
      />
      <h2 className="mt-4 text-lg text-gray-500">
        You do not have any Interview created
      </h2>

      <CreateInterviewDialog/>
    </div>
  );
};

export default EmptyState;
