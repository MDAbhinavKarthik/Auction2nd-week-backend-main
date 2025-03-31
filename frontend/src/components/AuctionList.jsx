import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

function AuctionList() {
	const [auctionItems, setAuctionItems] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchAuctionItems = async () => {
			try {
				const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auctions`);
				setAuctionItems(res.data);
				setSearchResults(res.data);
				setTotalPages(Math.ceil(res.data.length / ITEMS_PER_PAGE));
			} catch (err) {
				setError("Failed to load auction items");
				console.error("Error fetching auctions:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchAuctionItems();
	}, []);

	useEffect(() => {
		const filterItems = () => {
			const filteredItems = auctionItems.filter((item) => {
				const title = item.title || "";
				const description = item.description || "";
				const startingBid = item.startingBid
					? item.startingBid.toString()
					: "";
				const endDate = item.endDate
					? new Date(item.endDate).toLocaleDateString()
					: "";

				const searchTermString = searchTerm.toLowerCase();

				const matchesTitle = title
					.toLowerCase()
					.includes(searchTermString);
				const matchesDescription = description
					.toLowerCase()
					.includes(searchTermString);
				const matchesStartingBid =
					startingBid.includes(searchTermString);
				const matchesEndDate = endDate.includes(searchTermString);

				return (
					matchesTitle ||
					matchesDescription ||
					matchesStartingBid ||
					matchesEndDate
				);
			});
			setSearchResults(filteredItems);
			setTotalPages(
				Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 0
			);
			setCurrentPage(1);
		};
		filterItems();
	}, [searchTerm, auctionItems]);

	const handlePageChange = (page) => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedItems = searchResults.slice(startIndex, endIndex);

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-lg shadow-lg">
				<p className="text-center">Loading auctions...</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-lg shadow-lg">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-4xl font-bold">Auction Items</h2>
				<Link
					to="/create-auction"
					className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Create Auction
				</Link>
			</div>

			{error && (
				<div className="bg-red-500 text-white p-3 rounded-lg mb-4">
					{error}
				</div>
			)}

			<div className="mb-6">
				<input
					type="text"
					placeholder="Search by Title, Description, Starting Bid, End Date"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			{paginatedItems.length === 0 ? (
				<p className="text-center text-gray-400 my-8">
					No auction items found.
				</p>
			) : (
				<ul className="space-y-4">
					{paginatedItems.map((item) => (
						<li
							key={item.id}
							className="border border-gray-700 rounded-lg p-4 bg-gray-800 shadow-md"
						>
							<Link
								to={`/auction/${item.id}`}
								className="text-indigo-400 hover:underline text-lg font-semibold"
							>
								{item.title}
							</Link>
							<p className="text-gray-300 mt-2">
								{item.description}
							</p>
							<p className="text-gray-400 mt-2">
								<b>Starting Bid:</b> ${item.startingBid}
							</p>
							<p className="text-gray-400">
								<b>Current Bid:</b> ${item.currentBid || item.startingBid}
							</p>
							<p className="text-gray-400">
								<b>End Date: </b>
								{new Date(item.endDate).toLocaleDateString()}
							</p>
							{item.User && (
								<p className="text-gray-400">
									<b>Seller:</b> {item.User.username}
								</p>
							)}
						</li>
					))}
				</ul>
			)}

			{totalPages > 1 && (
				<div className="mt-6 flex justify-between items-center">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						className={`bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
						}`}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<span className="text-gray-400">
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						className={`bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							currentPage === totalPages
								? "cursor-not-allowed opacity-50"
								: ""
						}`}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}

export default AuctionList;
