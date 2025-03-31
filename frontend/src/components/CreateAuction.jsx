import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateAuction() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startingBid, setStartingBid] = useState('');
    const [endDate, setEndDate] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auctions`,
                {
                    title,
                    description,
                    startingBid: parseFloat(startingBid),
                    endDate,
                    imageUrl
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                navigate('/auctions');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create auction');
            console.error('Create auction error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-6">Create New Auction</h2>
            
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-300 mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        required
                        placeholder="Enter item title"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32"
                        required
                        placeholder="Enter item description"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-2">Starting Bid ($)</label>
                    <input
                        type="number"
                        value={startingBid}
                        onChange={(e) => setStartingBid(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter starting bid amount"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        required
                        min={today}
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-2">Image URL (optional)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="Enter image URL"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-3 text-white rounded-lg ${
                        loading
                            ? 'bg-indigo-700 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {loading ? 'Creating...' : 'Create Auction'}
                </button>
            </form>
        </div>
    );
}

export default CreateAuction; 