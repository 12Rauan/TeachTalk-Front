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
            
            // Create FormData object to handle file uploads
            const formData = new FormData();
            formData.append('title', newTask.title);
            formData.append('description', newTask.description);
            
            // Append each selected file to the FormData
            selectedFiles.forEach((file, index) => {
                formData.append('documents', file);
            });

            await axios.post(`${API_URL}/tasks`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Reset form
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
            
            // Append new files if any
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
            
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', documentId); // You might want to use the original filename here
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
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Task Manager</h2>
            
            {/* Create Task Form */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Create Task</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title"
                        className="border rounded w-full p-2"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Description"
                        className="border rounded w-full p-2 min-h-[100px]"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                        className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {uploading ? 'Creating Task...' : 'Add Task'}
                    </button>
                </div>
            </div>

            {/* Task List */}
            <h3 className="text-lg font-semibold mb-4">Task List</h3>
            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                        {editingTask?.id === task.id ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={editingTask.title}
                                    className="border rounded w-full p-2"
                                    onChange={(e) => setEditingTask({ 
                                        ...editingTask, 
                                        title: e.target.value 
                                    })}
                                />
                                <textarea
                                    value={editingTask.description}
                                    className="border rounded w-full p-2"
                                    onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        description: e.target.value
                                    })}
                                />
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="block w-full text-sm text-gray-500"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditTask(editingTask)}
                                        className="bg-green-500 text-white rounded py-1 px-3 hover:bg-green-600"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingTask(null)}
                                        className="bg-gray-500 text-white rounded py-1 px-3 hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-lg font-medium">{task.title}</h4>
                                        <p className="text-gray-600">{task.description}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="bg-red-500 text-white rounded py-1 px-3 hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => setEditingTask(task)}
                                            className="bg-yellow-500 text-white rounded py-1 px-3 hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Documents Section */}
                                {task.documents && task.documents.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-medium mb-2">Attached Documents:</h5>
                                        <div className="space-y-2">
                                            {task.documents.map((doc) => (
                                                <div key={doc._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <span className="text-sm">{doc.filename}</span>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDownloadDocument(task.id, doc._id)}
                                                            className="text-blue-500 hover:text-blue-600 text-sm"
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
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskManager;