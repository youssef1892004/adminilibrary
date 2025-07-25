import { useQuery } from "@tanstack/react-query";

interface AuthData {
  user: {
    id: string;
    email: string;
    roles: string[];
    dashboard: string;
    authorId?: string;
  };
}

export function useAuth() {
  const { data: authData, isLoading } = useQuery<AuthData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: authData?.user,
    isLoading,
    isAuthenticated: !!authData?.user,
  };
}