import { Database } from '@/lib/schema';
import { Session, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
type Todos = Database['public']['Tables']['todos']['Row'];


const Todo = ({ todo, onDelete }: { todo: Todos; onDelete: () => void }) => {
  const supabase = useSupabaseClient<Database>();
  const [isCompleted, setIsCompleted] = useState(todo.is_complete);

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from('todos')
        .update({ is_completed: !isCompleted })
        .eq('id', todo.id)
        .select()
        .single();

      if (data) setIsCompleted(data.is_completed);
    } catch (error) {
      console.log('Error toggling todo:', error);
    }
  };

  return (
    <li className="w-full block cursor-pointer focus:outline-none transition duration-150 ease-in-out bg-black text-white  ">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className={`text-medium leading-5 font-medium truncate  ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {todo.title}
          </div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={toggle}
            type="checkbox"
            checked={!!isCompleted}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded flex justify-center items-center bg-red-700" 
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" width="16" height="16">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button >
      </div>
    </li>
    
  );
};

export default Todo
