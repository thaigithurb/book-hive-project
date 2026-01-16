import { useCallback } from "react";
import debounce from "lodash.debounce";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UseFetchDataAdminParams = {
    status?: string;
    keyword?: string;
    page: number;
    sort?: any;
    limit: number;
    accessToken: unknown;
    ADMIN_PREFIX: unknown;
    onSuccess: (data: { items: any[]; total: number }) => void;
    setTotal: (total: number) => void;
    setLoading: (loading: boolean) => void;
    setIsFirstLoad: (isFirstLoad: boolean) => void;
    source: string;
};

export function useFetchDataAdmin({
    status,
    keyword,
    page,
    sort,
    limit,
    accessToken,
    ADMIN_PREFIX,
    onSuccess,
    setTotal,
    setLoading,
    setIsFirstLoad,
    source,
}: UseFetchDataAdminParams) {
    return useCallback(
        debounce(() => {
            setLoading(true);
            axios
                .get(`${API_URL}/api/v1/${ADMIN_PREFIX}/${source}`, {
                    params: {
                        ...(status && { status }),
                        ...(keyword && { keyWord: keyword }),
                        ...(sort && { sortKey: sort.key, sortValue: sort.value }),
                        page,
                        limit,
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                })
                .then((res) => {
                    onSuccess({
                        items: res.data[source] || [],
                        total: res.data.total || 0,
                    });
                    setTotal(res.data.total || 0);
                })
                .catch(() => {
                    onSuccess({ items: [], total: 0 });
                })
                .finally(() => {
                    setLoading(false);
                    setIsFirstLoad(false);
                });
        }, 400),
        [status, keyword, page, sort, limit, accessToken, ADMIN_PREFIX]
    );
}
