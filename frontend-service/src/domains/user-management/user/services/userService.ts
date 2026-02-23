import { axiosUse } from "@/lib/axiosFunc";
import { MutationConfig, QueryConfig } from "@/core/query/QueryProvider";
import { UserCreateFormValue } from "../validation/userValidation";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { ResponseDataCommon } from "@/core/api/types";
import { User } from "../types";

export async function getUsers(): Promise<ResponseDataCommon<User>> {
    try {
        const res = await axiosUse.get('/api/master/pengguna/view');
        const resData = res.data;

        return {
            data: resData.data
        }
    } catch (err){
        throw err;
    }
}

export const getUsersQueryKey = () => ['users'];
const getUsersQueryOptions = () => {
    return queryOptions({
        queryKey: getUsersQueryKey(),
        queryFn: getUsers
    });
}

type UseGetUsersParams = {
    queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
}

export const useGetUsers = (params: UseGetUsersParams = {}) => {
    return useQuery({
        ...getUsersQueryOptions(),
        ...params.queryConfig
    })
}