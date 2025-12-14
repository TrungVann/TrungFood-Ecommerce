import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

//Fetch user data from API
const fetchUser = async () => {
  const response = await axiosInstance.get("/api/logged-in-user");

  // React Query v5 không cho phép trả về undefined
  // Nếu user không tồn tại, trả về null thay vì undefined
  return response.data?.user ?? null;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;
