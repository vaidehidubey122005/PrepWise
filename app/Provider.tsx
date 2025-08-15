'use client'
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react'

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
    const { user } = useUser();
    const CreateUser = useMutation(api.users.CreateNewUser);

    const CreateNewUser = async () => {
        const result = await CreateUser({
            email: user?.primaryEmailAddress?.emailAddress ?? '',
            imageUrl: user?.imageUrl ?? '',
            name: user?.fullName ?? ''
        });
        console.log("User created or fetched:", result);
    };

    useEffect(() => {
        if (user) CreateNewUser();
    }, [user]);

    return (
        <div>{children}</div>
    );
};

export default Provider