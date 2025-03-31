const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const AuctionItem = sequelize.define('AuctionItem', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	startingBid: {
		type: DataTypes.FLOAT,
		allowNull: false
	},
	currentBid: {
		type: DataTypes.FLOAT,
		allowNull: true
	},
	endDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	imageUrl: {
		type: DataTypes.STRING,
		allowNull: true
	},
	status: {
		type: DataTypes.ENUM('active', 'ended'),
		defaultValue: 'active'
	},
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: User,
			key: 'id'
		}
	}
}, {
	timestamps: true
});

// Define relationships
AuctionItem.belongsTo(User, { foreignKey: 'userId' });

module.exports = AuctionItem;
