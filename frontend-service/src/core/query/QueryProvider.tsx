"use client";

import { QueryClient, QueryClientProvider, UseMutationOptions } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { AxiosError } from "axios";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Caching strategy
        staleTime: 5 * 60 * 1000, // 5 menit: Kapan data dianggap perlu di-refresh
        gcTime: 10 * 60 * 1000,   // 10 menit: Berapa lama data disimpan di memori
        
        // Smart Retry Logic
        retry: (failureCount, error) => {
          // Jangan lakukan retry jika error berasal dari kesalahan client/request (400-499)
          if (error instanceof AxiosError && error.status && error.status >= 400 && error.status < 500) {
            return false;
          }
          // Lakukan retry maksimal 3 kali untuk error server (500) atau masalah jaringan (Timeout)
          return failureCount < 3;
        },
        
        // UX Configurations
        refetchOnWindowFocus: false, // Jangan fetch ulang hanya karena ganti tab browser
        refetchOnReconnect: true,    // Fetch ulang otomatis jika internet sempat putus lalu nyambung lagi
      },
      mutations: {
        // Global error handler untuk operasi modifikasi data (POST/PUT/DELETE)
        onError: (error) => {
          alert('Terjadi sebuah kesalahan');
          // Sangat cocok jika nantinya ingin menambahkan tools monitoring seperti Sentry/Datadog di sini
        }
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

// 3. Getter Function: Mengatur arsitektur eksekusi (Server vs Client)
export function getQueryClient() {
  if (typeof window === "undefined") {
    // SERVER: Selalu buat instance baru untuk setiap request agar data antar user tidak saling tercampur
    return makeQueryClient();
  } else {
    // BROWSER: Buat instance satu kali saja (Singleton) dan gunakan kembali selama user tidak me-refresh halaman (F5)
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export interface QueryProviderProps {
  children: ReactNode;
}
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> = Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<ReturnType<T>, "queryKey" | "queryFn">;

export type MutationConfig<MutationFnType extends (...args: any) => Promise<any>> = UseMutationOptions<ApiFnReturnType<MutationFnType>, Error, Parameters<MutationFnType>[0]>;