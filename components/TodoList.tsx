import { Database } from '@/lib/schema';
import { Session, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import Todo from './Todo';
import Alert from './Alert';

type Todos = Database['public']['Tables']['todos']['Row'];

export default function TodoList({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const [todos, setTodos] = useState<Todos[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [errorText, setErrorText] = useState('');

  const user = session?.user;

  
useEffect(() => {
  if (user) {
    console.log('Current User ID:', user.id);
    fetchTodos(); 
    // Uncomment to add a test todo during development
    // addTestTodo(); 
  } else {
    console.log('No user session found.');
  }
}, [supabase, user]);

const fetchTodos = async () => {
  if (user) { 
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id) 
      .order('id', { ascending: true });

    if (error) {
      console.log('Error fetching todos:', error);
    } else {
      console.log('Fetched todos:', todos || []);
      if (todos.length === 0) {
        console.log('No todos found for the user');
      }
      setTodos(todos || []);
    }
  }
};


  const addTodo = async (taskText: string) => {
    const title = taskText.trim();
    if (!title) {
      setErrorText('Task cannot be empty');
      return; // Return early if the task is empty
    }

    console.log('Inserting todo with user ID:', user?.id);
    console.log('Task to insert:', title);

    const { data: todo, error } = await supabase
      .from('todos')
      .insert([
        {
          title,
          user_id: user?.id, 
          is_completed: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error.message);
      setErrorText(error.message);
    } else if (todo) {
      console.log('Successfully added todo:', todo);
      await fetchTodos(); // Re-fetch todos to update UI
      setNewTaskText(''); // Clear input after adding
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from('todos').delete().eq('id', id).throwOnError();
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.log('Error deleting todo:', error);
    }
  };

  if (!session) {
    return <div className="text-center mt-10 text-lg">Please log in to view your todo list.</div>;
  }

  return (
    <div className="w-full">
      <h1 className="mb-12 text-2xl font-semibold">Todo List</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(newTaskText);
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2 border border-gray-300"
          type="text"
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => {
            setErrorText('');
            setNewTaskText(e.target.value);
          }}
        />
        <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800" type="submit">
          Add
        </button>
      </form>

      {!!errorText && <Alert text={errorText} />}

      <div className="bg-white shadow overflow-hidden rounded-md mt-4">
        <ul>
          {todos.map((todo) => (
            <Todo key={todo.id} todo={todo} onDelete={() => deleteTodo(todo.id)} />
          ))}
        </ul>
      </div>
    </div>
  );
}




