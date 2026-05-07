import {useUserWithProfile} from "@/hooks/users/user.hook.ts";

export const useSchoolId = (userId?: string) => {
    const { data } = useUserWithProfile(userId);

    return data?.schoolAdminProfile?.schoolId;
};