import { axiosUse } from "@/lib/axiosFunc";
import { MutationConfig, queryClient, QueryConfig } from "@/core/query/QueryProvider";
import { UserCreateFormValue } from "../validation/userValidation";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { ResponseData, ResponseDataCommon } from "@/core/api/types";
import { User, UserCreateApi } from "../types";

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

// create user
export async function createUser(data: UserCreateFormValue): Promise<ResponseData<User>> {
    const dataCasting: UserCreateApi = {
        username: data.username,
        nama: data.nama,
        roleId: Number(data.roleId),
        password: data.password,
        confirm_password: data.confirm_password
    }

    try {
        const res = await axiosUse.post('/api/master/pengguna/create-pengguna', dataCasting);
        const resData = await res.data;

        return {
            data: resData.data,
            message: resData.message
        }
    } catch (err){
        throw err
    }
}

type UseCreateUserParams = {
    mutationConfig?: MutationConfig<typeof createUser>;
}

export const useCreateUser = (params: UseCreateUserParams = {}) => {
    return useMutation({
        mutationFn: createUser,
        ...params.mutationConfig,
        onSuccess: (data, variable, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })
            params.mutationConfig?.onSuccess?.(data, variable, onMutateResult, context)
        }
    })
}
