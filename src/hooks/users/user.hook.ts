// user.hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/users.api.ts';

export const useUserWithProfile = (userId: string) => {
    return useQuery({
        queryKey: ['userWithProfile', userId],
        queryFn: () => api.getUserWithProfile(userId),
    });
};

// export const useCreateUser = () => {
//     const qc = useQueryClient();
//
//     return useMutation({
//         mutationFn: api.createUser,
//         onSuccess: () => {
//             qc.invalidateQueries(['users']);
//         },
//     });
// };

// export const useUpdateUser = () => {
//     const qc = useQueryClient();
//
//     return useMutation({
//         mutationFn: ({ id, data }) => api.updateUser(id, data),
//         onSuccess: () => {
//             qc.invalidateQueries(['users']);
//         },
//     });
// };