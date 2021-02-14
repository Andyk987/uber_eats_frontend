import { 
	ApolloClient,
	InMemoryCache,
	makeVar,
	createHttpLink,
	split
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { LOCALSTORAGE_TOKEN } from './constants';

const token = localStorage.getItem(LOCALSTORAGE_TOKEN);
export const isLoggedInVar = makeVar(Boolean(token));
export const authTokenVar = makeVar(token);

const wsLink = new WebSocketLink({
	uri: process.env.NODE_ENV === 'production' ? "wss://uber-eats-clone.herokuapp.com/" : 'wss://bycproject.run.goorm.io/graphql',
	options: {
		reconnect: true,
		connectionParams: {
			"x-jwt": authTokenVar() || "",
		},
	},
});

const httpLink = createHttpLink({
	uri: process.env.NODE_ENV === 'production' ? "https://uber-eats-clone.herokuapp.com/" : 'https://bycproject.run.goorm.io/graphql',
});

const authLink = setContext((_, { headers }) => {
	return {
		headers: {
			...headers,
			"x-jwt": authTokenVar() || "",
		},
	};
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					isLoggedIn: {
						read() {
							return isLoggedInVar();
						},
					},
					token: {
						read() {
							return authTokenVar();
						}
					}
				}
			}
		}
	})
});