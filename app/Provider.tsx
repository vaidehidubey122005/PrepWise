import { userDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react';


function Provider({ children }: any) {

    const { user } = useUser();
    const CreateUser = useMutation(api.users.CreateNewUser);
    const [userDetail, setUserDetail] = useState<any>(undefined);
    console.log('user')
    useEffect(() => {

        user && CreateNewUser();
    }, [user])

    const CreateNewUser = async () => {
        if (user) {
            const result = await CreateUser({
                email: user?.primaryEmailAddress?.emailAddress ?? '',
                imageUrl: user?.imageUrl,
                name: user?.fullName ?? ''
            });
            console.log(result)
        setUserDetail(result);
    }
}

    return (
        <userDetailContext.Provider value={{ userDetail, setUserDetail }}>
            <div>{children}</div>
        </userDetailContext.Provider>
    );
}

export default Provider;

export const useUserDetailContext = () => useContext(userDetailContext);