import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust this based on your backend URL

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const response = await axios.get(`${API_URL}/tasks`);
        setTasks(response.data);
    };

    const handleCreateTask = async () => {
        await axios.post(`${API_URL}/tasks`, newTask);
        setNewTask({ title: '', description: '' });
        fetchTasks();
    };

    const handleEditTask = async (task) => {
        await axios.put(`${API_URL}/tasks/${task.id}`, task);
        setEditingTask(null);
        fetchTasks();
    };

    const handleDeleteTask = async (taskId) => {
        await axios.delete(`${API_URL}/tasks/${taskId}`);
        fetchTasks();
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Task Manager</h2>
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Create Task</h3>
                <input
                    type="text"
                    placeholder="Title"
                    className="border rounded w-full p-2 mb-2"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    className="border rounded w-full p-2 mb-4"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <button
                    onClick={handleCreateTask}
                    className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600"
                >
                    Add Task
                </button>
            </div>

            <h3 className="text-lg font-semibold mb-2">Task List</h3>
            <ul className="list-disc pl-5">
                {tasks.map((task) => (
                    <li key={task.id} className="flex justify-between items-center mb-2">
                        {editingTask?.id === task.id ? (
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={editingTask.title}
                                    className="border rounded p-2"
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                />
                                <button
                                    onClick={() => handleEditTask(editingTask)}
                                    className="ml-2 bg-green-500 text-white rounded py-1 px-3 hover:bg-green-600"
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <span className="flex-grow">{task.title}</span>
                        )}
                        <div>
                            <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="bg-red-500 text-white rounded py-1 px-3 hover:bg-red-600"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setEditingTask(task)}
                                className="ml-2 bg-yellow-500 text-white rounded py-1 px-3 hover:bg-yellow-600"
                            >
                                Edit
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskManager;
