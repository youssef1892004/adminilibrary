// GraphQL configuration only - no local database needed
export const GRAPHQL_ENDPOINT = "https://graphql-333f98f9a304.hosted.ghaymah.systems/v1/graphql";
export const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || "yjHfpXbYZlSkBbvKjudDOpwDnLAHUuXP";

// GraphQL helper function
export async function graphqlRequest(query: string, variables?: any) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}