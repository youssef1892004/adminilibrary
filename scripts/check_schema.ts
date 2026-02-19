
import { graphqlRequest } from '../server/db';

async function checkSchema() {
  const query = `
    query {
      __type(name: "libaray_Favorite") {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  try {
    console.log("Fetching schema for libaray_Favorite...");
    const data = await graphqlRequest(query, {});

    if (data && data.__type) {
      console.log("Schema found for libaray_Favorite:");
      data.__type.fields.forEach((f: any) => {
        let typeName = f.type.name;
        if (!typeName && f.type.ofType) {
          typeName = f.type.ofType.name;
          if (!typeName && f.type.ofType.ofType) {
            typeName = f.type.ofType.ofType.name;
          }
        }
        console.log(`- ${f.name}: ${typeName} (${f.type.kind})`);
      });
    } else {
      console.log("Type 'libaray_Favorite' not found or no data returned.");
      // Try listing all types to see if the name is slightly different
      const allTypesQuery = `
            query {
                __schema {
                    types {
                        name
                    }
                }
            }
        `;
      const allTypes = await graphqlRequest(allTypesQuery, {});
      console.log("Available types (filtering for Chapter):");
      console.log(allTypes.__schema.types.filter((t: any) => t.name.toLowerCase().includes('chapter')).map((t: any) => t.name));
    }
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

checkSchema();
