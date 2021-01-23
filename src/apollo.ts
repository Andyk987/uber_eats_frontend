import { ApolloClient, InMemoryCache, makeVar } from '@apollo/client';

export const isLoggedInVar = makeVar(false);

export const client = new ApolloClient({
  uri: 'https://bycproject.run.goorm.io/graphql',
  cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					isLoggedIn: {
						read() {
							return isLoggedInVar();
						}
					}
				}
			}
		}
	})
});