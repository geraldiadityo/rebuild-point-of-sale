import { axiosUse } from "@/lib/axiosFunc";
import { MutationConfig, QueryConfig } from "@/core/query/QueryProvider";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { ResponseDataCommon } from "@/core/api/types";
import { Role } from "../types";

export async function getRoles(): Promise<ResponseDataCommon<Role>> {
    try {
        const res = await axiosUse.get('/api/master/role');
        const resData = res.data

        return {
            data: resData.data
        }
    } catch(err){
        throw err
    }
}

export const getRolesQueryKey = () => ['roles'];
const getRolesQueryOptions = () => {
    return queryOptions({
        queryKey: getRolesQueryKey(),
        queryFn: getRoles
    })
}

type UseGetRolesParams = {
    queryConfig?: QueryConfig<typeof getRolesQueryOptions>;
}

export const useGetRoles = (params: UseGetRolesParams = {}) => {
    return useQuery({
        ...getRolesQueryOptions(),
        ...params.queryConfig
    })
}