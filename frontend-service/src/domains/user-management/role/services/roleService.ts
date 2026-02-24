import { axiosUse } from "@/lib/axiosFunc";
import { MutationConfig, QueryConfig } from "@/core/query/QueryProvider";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { ResponseData, ResponseDataCommon } from "@/core/api/types";
import { Role } from "../types";
import { RoleFormValue } from "../validation/roleValidation";
import { queryClient } from "@/core/query/QueryProvider";

// Get data Roles
export async function getRoles(): Promise<ResponseDataCommon<Role>> {
    try {
        const res = await axiosUse.get('/api/master/role/view');
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

// create data roles
export async function createRole(data: RoleFormValue): Promise<ResponseData<Role>> {
    try {
        const res = await axiosUse.post('/api/master/role/create-role', data);
        
        const resData = await res.data;
        
        return {
            data: resData.data,
            message: resData.message
        }
    } catch (err){
        throw err
    }
}

type UseCreateRoleParams = {
    mutationConfig?: MutationConfig<typeof createRole>;
}

export const useCreateRole = (params: UseCreateRoleParams = {}) => {
    return useMutation({
        mutationFn: createRole,
        ...params.mutationConfig,
        onSuccess: (data, variable, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: getRolesQueryKey() })
            params.mutationConfig?.onSuccess?.(data, variable, onMutateResult, context)
        }
    })
}

// update data roles
export async function updateRole({id, data}: { id: number, data: RoleFormValue }): Promise<ResponseData<Role>> {
    try {
        const res = await axiosUse.put(`/api/master/role/update-role/${id}`, data);
        const resData = await res.data;
        
        return {
            data: resData.data,
            message: resData.message
        }
    } catch (err){
        throw err
    }
}

type UseUpdateRoleParams = {
    mutationConfig?: MutationConfig<typeof updateRole>;
}

export const useUpdateRole = (params: UseUpdateRoleParams = {}) => {
    return useMutation({
        mutationFn: updateRole,
        ...params.mutationConfig,
        onSuccess: (data, variable, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: getRolesQueryKey() })
            params.mutationConfig?.onSuccess?.(data, variable, onMutateResult, context)
        }
    })
}

// remove data roles

export async function deleteRole(id: number): Promise<ResponseData<boolean>> {
    try {
        const res = await axiosUse.delete(`/api/master/role/delete-role/${id}`)
        const resData = await res.data;
        
        return {
            data: resData.data,
            message: resData.message
        }
    } catch (err){
        throw err
    }
}

type UseDeleteRoleParams = {
    mutationConfig?: MutationConfig<typeof deleteRole>;
}

export const useDeleteRole = (params: UseDeleteRoleParams = {}) => {
    return useMutation({
        mutationFn: deleteRole,
        ...params.mutationConfig,
        onSuccess: (data, variable, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: getRolesQueryKey() })
            params.mutationConfig?.onSuccess?.(data, variable, onMutateResult, context)
        }
    })
}