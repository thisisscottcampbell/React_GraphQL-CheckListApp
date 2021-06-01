import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ApolloClient, { gql } from 'apollo-boost';

const client = new ApolloClient({
	uri: 'https://reactgraphqltask.herokuapp.com/v1/graphql',
});

client
	.query({
		query: gql`
			query getTodos {
				todos {
					done
					id
					text
				}
			}
		`,
	})
	.then((data) => console.log(data.data));

ReactDOM.render(<App />, document.getElementById('root'));
