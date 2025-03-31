const AuctionItem = require("../models/AuctionItem");
const Bid = require("../models/Bid");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');

const createAuctionItem = async (req, res) => {
	const { title, description, startingBid, endDate, imageUrl } = req.body;
	const userId = req.user.id;

	try {
		const newDate = new Date(endDate);
		const auctionItem = await AuctionItem.create({
			title,
			description,
			startingBid,
			currentBid: startingBid,
			endDate: newDate,
			imageUrl,
			userId,
			status: 'active'
		});

		res.status(201).json(auctionItem);
	} catch (error) {
		console.error('Create auction error:', error);
		res.status(500).json({ message: error.message });
	}
};

const getAuctionItems = async (req, res) => {
	const { search } = req.query;
	try {
		let whereClause = {};
		
		if (search) {
			whereClause = {
				[Op.or]: [
					{ title: { [Op.like]: `%${search}%` } },
					{ description: { [Op.like]: `%${search}%` } }
				]
			};
		}

		const auctionItems = await AuctionItem.findAll({
			where: whereClause,
			include: [{
				model: User,
				attributes: ['username']
			}],
			order: [['createdAt', 'DESC']]
		});

		res.status(200).json(auctionItems);
	} catch (error) {
		console.error('Get auctions error:', error);
		res.status(500).json({ message: error.message });
	}
};

const getAuctionItemById = async (req, res) => {
	const { id } = req.params;
	try {
		const auctionItem = await AuctionItem.findByPk(id, {
			include: [{
				model: User,
				attributes: ['username']
			}]
		});
		
		if (!auctionItem) {
			return res.status(404).json({ message: "Auction item not found" });
		}
		
		res.status(200).json(auctionItem);
	} catch (error) {
		console.error('Get auction by id error:', error);
		res.status(500).json({ message: error.message });
	}
};

const getAuctionItemsByUser = async (req, res) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		
		const auctionItems = await AuctionItem.findAll({
			where: { userId: decoded.id },
			include: [{
				model: User,
				attributes: ['username']
			}],
			order: [['createdAt', 'DESC']]
		});
		
		res.status(200).json({ auctionItems });
	} catch (error) {
		console.error('Get user auctions error:', error);
		res.status(500).json({ message: error.message });
	}
};

const updateAuctionItem = async (req, res) => {
	const { id } = req.params;
	const { title, description, startingBid, endDate, imageUrl } = req.body;
	const userId = req.user.id;

	try {
		const auctionItem = await AuctionItem.findByPk(id);

		if (!auctionItem) {
			return res.status(404).json({ message: "Auction item not found" });
		}

		if (auctionItem.userId !== userId) {
			return res.status(403).json({ message: "Unauthorized action" });
		}

		await auctionItem.update({
			title: title || auctionItem.title,
			description: description || auctionItem.description,
			startingBid: startingBid || auctionItem.startingBid,
			endDate: endDate ? new Date(endDate) : auctionItem.endDate,
			imageUrl: imageUrl || auctionItem.imageUrl
		});

		res.json(auctionItem);
	} catch (error) {
		console.error('Update auction error:', error);
		res.status(500).json({ message: error.message });
	}
};

const deleteAuctionItem = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.id;

	try {
		const auctionItem = await AuctionItem.findByPk(id);

		if (!auctionItem) {
			return res.status(404).json({ message: "Auction item not found" });
		}

		if (auctionItem.userId !== userId) {
			return res.status(403).json({ message: "Unauthorized action" });
		}

		// Delete associated bids first
		await Bid.destroy({ where: { auctionItemId: id } });
		
		// Delete the auction item
		await auctionItem.destroy();

		res.json({ message: "Auction item removed" });
	} catch (error) {
		console.error('Delete auction error:', error);
		res.status(500).json({ message: error.message });
	}
};

const getAuctionWinner = async (req, res) => {
	const { id } = req.params;
	try {
		const auctionItem = await AuctionItem.findById(id);
		if (!auctionItem) {
			return res
				.status(404)
				.json({ winner: "", message: "Auction item not found" });
		}

		if (new Date(auctionItem.endDate) > new Date(Date.now())) {
			return res
				.status(400)
				.json({ winner: "", message: "Auction has not ended yet" });
		}

		const bids = await Bid.find({ auctionItemId: id });
		if (bids.length === 0) {
			return res
				.status(200)
				.json({ winner: "", message: "No bids found" });
		}

		let highestBid = bids.reduce(
			(max, bid) => (bid.bidAmount > max.bidAmount ? bid : max),
			bids[0]
		);

		const winner = await User.findById(highestBid.userId);
		if (!winner) {
			return res
				.status(404)
				.json({ winner: "", message: "Winner not found" });
		}

		res.status(200).json({ winner });
	} catch (error) {
		console.error("Error fetching auction winner:", error);
		res.status(500).json({ message: error.message });
	}
};

const getAuctionsWonByUser = async (req, res) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		const { id } = decodedToken;

		const bidsByUser = await Bid.find({ userId: id });
		const auctionIds = bidsByUser.map((bid) => bid.auctionItemId);

		const uniqueAuctionIds = [...new Set(auctionIds)];

		let wonAuctions = [];

		for (let i = 0; i < uniqueAuctionIds.length; i++) {
			const auctionItemId = uniqueAuctionIds[i];
			const bids = await Bid.find({ auctionItemId });
			let winningBid = bids.reduce(
				(max, bid) => (bid.bidAmount > max.bidAmount ? bid : max),
				bids[0]
			);

			const auctionItem = await AuctionItem.findById(auctionItemId);
			const isAuctionEnded =
				new Date(auctionItem.endDate) <= new Date(Date.now());

			if (isAuctionEnded && winningBid.userId.toString() === id) {
				wonAuctions.push({
					auctionId: auctionItemId,
					title: auctionItem.title,
					description: auctionItem.description,
					winningBid: winningBid.bidAmount,
					endDate: auctionItem.endDate,
				});
			}
		}
		res.status(200).json({ wonAuctions });
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	createAuctionItem,
	getAuctionItems,
	updateAuctionItem,
	deleteAuctionItem,
	getAuctionItemById,
	getAuctionItemsByUser,
	getAuctionWinner,
	getAuctionsWonByUser,
};
