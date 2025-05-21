import { useEffect, useState } from 'react';
import { supabase } from '../lib/initSupabase';
import Notification from './Notification'; 

interface Task {
    id: string;
    title: string;
    assigned_to: string;
    created_by: string;
    due_date: string;
    is_completed: boolean;
}

const TaskManager = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [filter, setFilter] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const currentUserID = '4e83cb09-0e0b-4bdb-a914-e0c278668885'; // Replace with the actual ID for the logged-in user
    const creatorID = '8f8e25bc-e289-4d9d-ae2c-a30ba04d71ab'; // Your user_id UUID

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const { data, error } = await supabase.from('todos').select('*');
        if (error) {
            console.error(error);
            setNotification({ message: 'Failed to fetch tasks.', type: 'error' });
        } else {
            setTasks(data);
            setFilteredTasks(data); // Initialize filtered tasks
        }
    };

    const addTask = async () => {
        const { data, error } = await supabase
            .from('todos')
            .insert([{ 
                title, 
                assigned_to: currentUserID, // Example user ID
                created_by: creatorID, 
                due_date: new Date(dueDate).toISOString(), 
                is_completed: false 
            }]);
        
        if (error) {
            console.error('Error adding task:', error);
            setNotification({ message: 'Error adding task.', type: 'error' });
        } else {
            // Clear input fields
            setTitle('');
            setDueDate('');
            setAssignedTo('');
            fetchTasks(); // Re-fetch tasks to include the new one
            setNotification({ message: 'Task added successfully!', type: 'success' }); // Set success notification
        }
    };

    const deleteTask = async (taskId: string) => {
        const { data, error } = await supabase
            .from('todos')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            setNotification({ message: 'Error deleting task.', type: 'error' });
        } else {
            // Update local state to reflect the deletion
            setTasks(tasks.filter(task => task.id !== taskId));
            setFilteredTasks(filteredTasks.filter(task => task.id !== taskId));
            setNotification({ message: 'Task deleted successfully!', type: 'success' }); // Set delete notification
        }
    };

    const filterTasks = (criteria: string) => {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        let updatedTasks: Task[];

        switch (criteria) {
            case 'assigned_to_me':
                updatedTasks = tasks.filter(task => task.assigned_to === currentUserID); // Updated: replacing hardcoded user ID
                break;
            case 'created_by_me':
                updatedTasks = tasks.filter(task => task.created_by === creatorID); // Updated: using actual creator ID
                break;
            case 'overdue':
                updatedTasks = tasks.filter(task => new Date(task.due_date) < new Date());
                break;
            case 'due_today':
                updatedTasks = tasks.filter(task => new Date(task.due_date).toISOString().split('T')[0] === today); // Corrected to check today's due date
                break;
            default:
                updatedTasks = tasks; // No filter, show all tasks
        }

        setFilteredTasks(updatedTasks); // Set the filtered tasks in the state
        setFilter(criteria); // Set the current filter
    };

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <h2 className="text-3xl mb-4">Task Manager</h2>

            {notification && (
                <Notification message={notification.message} type={notification.type} />
            )}

            <div className="mb-4">
                <input 
                    type="text" 
                    placeholder="Task Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="border border-gray-600 p-2 placeholder-gray-700 text-black rounded w-full mb-2"
                />
                <input 
                    type="text" 
                    placeholder="Assign to User ID" 
                    value={assignedTo} 
                    onChange={(e) => setAssignedTo(e.target.value)} 
                    className="border border-gray-600 p-2 placeholder-gray-700 text-black rounded w-full mb-2"
                />
                <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="border border-gray-600 p-2 placeholder-gray-700 text-black rounded w-full mb-4"
                />
                <button 
                    onClick={addTask} 
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-400">
                    Add Task
                </button>
            </div>
        
            {/* Filter Buttons */}
            <div className="mb-4">
                <button onClick={() => { fetchTasks(); setFilter(''); }} className="bg-green-500 text-white p-2 rounded hover:bg-green-400 mr-2">
                    All Tasks
                </button>
                <button onClick={() => filterTasks('assigned_to_me')} className="bg-green-500 text-white p-2 rounded hover:bg-green-400 mr-2">
                    Tasks Assigned to Me
                </button>
                <button onClick={() => filterTasks('created_by_me')} className="bg-green-500 text-white p-2 rounded hover:bg-green-400 mr-2">
                    My Created Tasks
                </button>
                <button onClick={() => filterTasks('overdue')} className="bg-green-500 text-white p-2 rounded hover:bg-green-400 mr-2">
                    Overdue Tasks
                </button>
                <button onClick={() => filterTasks('due_today')} className="bg-green-500 text-white p-2 rounded hover:bg-green-400">
                    Tasks Due Today
                </button>
            </div>
        
            {/* Display tasks */}
            <ul className="space-y-2">
                {filteredTasks.map(task => (
                    <li key={task.id} className="border border-gray-600 p-2 rounded flex justify-between items-center">
                        <div>
                            <strong>{task.title}</strong> - Assigned to: {task.assigned_to} - Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <button 
                            onClick={() => deleteTask(task.id)} 
                            className="bg-red-500 text-white p-1 ml-4 rounded hover:bg-red-400">
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskManager;
