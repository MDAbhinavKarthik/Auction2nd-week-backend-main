const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const AuctionItem = require('./AuctionItem');

const Bid = sequelize.define('Bid', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	bidAmount: {
		type: DataTypes.FLOAT,
		allowNull: false
	},
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: User,
			key: 'id'
		}
	},
	auctionItemId: {
		type: DataTypes.INTEGER,
		references: {
			model: AuctionItem,
			key: 'id'
		}
	}
}, {
	timestamps: true
});

// Define relationships
Bid.belongsTo(User, { foreignKey: 'userId' });
Bid.belongsTo(AuctionItem, { foreignKey: 'auctionItemId' });

module.exports = Bid;
