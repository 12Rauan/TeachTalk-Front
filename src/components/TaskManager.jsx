import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ 
        title: '', 
        description: '', 
        documents: [] 
    });
    const [editingTask, setEditingTask] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/tasks`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
    };

    const handleCreateTask = async () => {
        try {
            setUploading(true);
            
            const formData = new FormData();
            formData.append('title', newTask.title);
            formData.append('description', newTask.description);
            
            selectedFiles.forEach((file) => {
                formData.append('documents', file);
            });

            await axios.post(`${API_URL}/tasks`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setNewTask({ title: '', description: '', documents: [] });
            setSelectedFiles([]);
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleEditTask = async (task) => {
        try {
            const formData = new FormData();
            formData.append('title', task.title);
            formData.append('description', task.description);
            
            selectedFiles.forEach((file) => {
                formData.append('documents', file);
            });

            await axios.put(`${API_URL}/tasks/${task.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEditingTask(null);
            setSelectedFiles([]);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleDownloadDocument = async (taskId, documentId) => {
        try {
            const response = await axios.get(
                `${API_URL}/tasks/${taskId}/documents/${documentId}`,
                { responseType: 'blob' }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', documentId); 
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    const handleDeleteDocument = async (taskId, documentId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}/documents/${documentId}`);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Task Manager</h2>
            
            {/* Create Task Form */}
            <div className="mb-10 bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Create Task</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title"
                        className="border rounded w-full p-3 text-gray-700"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Description"
                        className="border rounded w-full p-3 text-gray-700 min-h-[100px]"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-100">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 mb-2"
                        />
                        {selectedFiles.length > 0 && (
                            <div className="text-sm text-gray-600">
                                Selected files: {selectedFiles.map(file => file.name).join(', ')}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleCreateTask}
                        disabled={uploading || !newTask.title.trim()}
                        className="bg-blue-500 text-white rounded py-2 px-6 mt-2 hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {uploading ? 'Creating Task...' : 'Add Task'}
                    </button>
                </div>
            </div>

            {/* Task List */}
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Task List</h3>
            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-6 bg-gray-50 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-lg font-medium text-gray-800">{task.title}</h4>
                                <p className="text-gray-600">{task.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-gray-500 hover:bg-red-500 hover:text-white rounded py-1 px-3 transition-colors duration-200"
                                >
                                    🗑️ Delete
                                </button>
                                <button
                                    onClick={() => setEditingTask(task)}
                                    className="text-gray-500 hover:bg-yellow-500 hover:text-white rounded py-1 px-3 transition-colors duration-200"
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                        </div>
                        
                        {/* Documents Section */}
                        {task.documents && task.documents.length > 0 && (
                            <div className="mt-4">
                                <h5 className="text-sm font-medium mb-2 text-gray-700">Attached Documents:</h5>
                                <div className="space-y-2">
                                    {task.documents.map((doc) => (
                                        <div key={doc._id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <span className="text-sm text-gray-800">{doc.filename}</span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleDownloadDocument(task.id, doc._id)}
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDocument(task.id, doc._id)}
                                                    className="text-red-500 hover:text-red-600 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskManager;
