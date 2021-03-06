import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

//get todos
const GET_TODOS = gql`
	query getTodos {
		todos {
			done
			id
			text
		}
	}
`;

//toggle todos
const TOGGLE_TODO = gql`
	mutation toggleTodo($id: uuid!, $done: Boolean!) {
		update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
			returning {
				done
				id
				text
			}
		}
	}
`;

//add todo
const ADD_TODO = gql`
	mutation addTodo($text: String!) {
		insert_todos(objects: { text: $text }) {
			returning {
				done
				id
				text
			}
		}
	}
`;

const DELETE_TODO = gql`
	mutation deleteTodo($id: uuid!) {
		delete_todos(where: { id: { _eq: $id } }) {
			returning {
				done
				id
				text
			}
		}
	}
`;

const App = () => {
	const [input, setInput] = useState('');
	const { data, loading, error } = useQuery(GET_TODOS);
	const [deleteTodo] = useMutation(DELETE_TODO);
	const [toggleTodo] = useMutation(TOGGLE_TODO);
	const [addTodo] = useMutation(ADD_TODO);

	if (loading) return <div>Loading todos...</div>;
	if (error) return <div>Error fetching todos!</div>;

	const handleToggle = async (todoData) => {
		const { id, done } = todoData;
		const toggled = await toggleTodo({
			variables: { id, done: !done },
		});
		console.log(toggled);
	};

	const handleAddTodo = async (event) => {
		event.preventDefault();

		if (!input.trim()) return;

		const data = await addTodo({
			variables: { text: input },
			refetchQueries: [{ query: GET_TODOS }],
		});
		console.log(data);
		setInput('');
	};

	const handleDelete = async (todoData) => {
		const { id } = todoData;
		const isConfirmed = window.confirm('Do you want to delete this task?');

		if (isConfirmed) {
			const data = await deleteTodo({
				variables: { id },
				update: (cache) => {
					const prevData = cache.readQuery({ query: GET_TODOS });
					const newTodos = prevData.todos.filter((todo) => todo.id !== id);
					cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } });
				},
			});
		}
		console.log(data);
	};

	return (
		<div className="vh-100 code flex flex-column items-center bg-purple white pa3 f1-1">
			<h1 className="f2-1">
				GraphQL CheckList{' '}
				<span role="img" aria-label="Checkmark">
					???
				</span>
			</h1>
			<form className="mb3" onSubmit={handleAddTodo}>
				<input
					value={input}
					type="text"
					placeholder="Write your todo"
					className="pa2 f4 b--dashed"
					onChange={(event) => setInput(event.target.value)}
				/>
				<button type="submit" className="pa2 f4 bg-green">
					Create
				</button>
			</form>
			<div className="flex items-center justify-center flex-column">
				{data.todos.map((todo) => (
					<p onDoubleClick={() => handleToggle(todo)} key={todo.id}>
						<span className={`pointer list pa1 f3 ${todo.done && 'strike'}`}>
							{todo.text}
						</span>
						<button
							onClick={() => handleDelete(todo)}
							className="bg-transparent bn f4"
						>
							<span className="red">&times;</span>
						</button>
					</p>
				))}
			</div>
		</div>
	);
};

export default App;
