import React from 'react';

const Subscription = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Subscription Plans</h2>
            <div className="grid gap-6 md:grid-cols-3">
                {/* Pro Plan */}
                <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Pro Plan</h3>
                    <p className="text-gray-600 mb-4">Perfect for individuals looking to enhance their experience.</p>
                    <p className="text-2xl font-bold text-gray-800">$10/month</p>
                    <button className="mt-4 bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600">
                        Subscribe
                    </button>
                </div>

                {/* Team Plan */}
                <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Team Plan</h3>
                    <p className="text-gray-600 mb-4">Ideal for small teams that want to work together efficiently.</p>
                    <p className="text-2xl font-bold text-gray-800">$20/month</p>
                    <button className="mt-4 bg-green-500 text-white rounded py-2 px-4 hover:bg-green-600">
                        Subscribe
                    </button>
                </div>

                {/* Business Plan */}
                <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Business Plan</h3>
                    <p className="text-gray-600 mb-4">Best for enterprises that need advanced features.</p>
                    <p className="text-2xl font-bold text-gray-800">$25/month</p>
                    <button className="mt-4 bg-purple-500 text-white rounded py-2 px-4 hover:bg-purple-600">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
