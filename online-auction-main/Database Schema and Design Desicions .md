# 📊 Auction System Database Schema and Design Decisions

## 🗃️ Database Schema

The Auction System uses MongoDB, a NoSQL database. Here are the main collections and their schemas:

### 1. User Collection

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  createdAt: Date
}
```

### 2. AuctionItem Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startingBid: Number,
  endDate: Date,
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bid Collection

```javascript
{
  _id: ObjectId,
  auctionItemId: ObjectId, // Reference to AuctionItem
  userId: ObjectId, // Reference to User
  bidAmount: Number,
  createdAt: Date
}
```

## 📊 ER Diagram

![ER Diagram](https://github.com/the-darklord/Auction-Bidding-System/blob/main/ER_Diagram%20.svg)


## 🧠 Design Decisions

1. **Use of MongoDB**:

    - Chosen for its flexibility and scalability, which is beneficial for a system that may need to evolve quickly.
    - Schema-less nature allows for easy additions of new fields without migrations.

2. **Separate Collections**:

    - Users, AuctionItems, and Bids are kept in separate collections to maintain clear boundaries and allow for easier querying and indexing.

3. **Reference-based Relationships**:

    - Used ObjectId references instead of embedding documents. This keeps the data normalized and allows for more efficient updates.

4. **Timestamps**:

    - Both `createdAt` and `updatedAt` fields are included in the AuctionItem schema to track when items are created and modified.
    - Only `createdAt` is used in User and Bid schemas as these are typically not updated after creation.

5. **Password Hashing**:

    - User passwords are hashed before storage for security.

6. **Bid History**:

    - Each bid is stored as a separate document in the Bid collection, allowing for easy retrieval of bid history and efficient queries for highest bids.

7. **Auction End Date**:

    - Stored as a Date field in the AuctionItem document, allowing for easy querying of active vs. ended auctions.

8. **Starting Bid**:

    - Included in the AuctionItem schema to set an initial price and validate incoming bids.

9. **User-Auction Relationship**:

    - The `createdBy` field in AuctionItem links back to the User who created the auction, allowing for easy querying of a user's auctions.

10. **Indexing Considerations**:

    - Likely indexes on `email` in User collection for quick lookup during authentication.
    - Indexes on `auctionItemId` and `userId` in Bid collection for efficient bid history retrieval.
    - Index on `endDate` in AuctionItem collection to quickly find active auctions.

11. **Soft Deletes**:

    - The current schema doesn't include soft deletes. If needed, an `isDeleted` boolean field could be added to relevant schemas.

12. **Scalability**:

    - The schema design allows for horizontal scaling. Sharding could be implemented on the `_id` field if needed for very large datasets.

13. **Auction Winner Determination**:

    - Winner is not stored directly in the AuctionItem document. Instead, it's determined by querying the highest bid after the auction end date.

14. **Bid Validation**:

    - The API checks if a new bid is higher than the current highest bid, ensuring data integrity.

15. **User Authentication**:

    - JWT tokens are used for user authentication, with the tokens stored in HTTP-only cookies for security.

16. **Relationships**:
    - User to AuctionItem: One-to-Many (A user can create multiple auction items)
    - User to Bid: One-to-Many (A user can place multiple bids)
    - AuctionItem to Bid: One-to-Many (An auction item can have multiple bids)

These design decisions create a flexible, scalable, and secure foundation for the Auction System. The schema can be easily extended to include additional features such as categories, item images, or user ratings in the future.

The ER diagram visually represents these relationships, showing how Users, AuctionItems, and Bids are interconnected. This structure allows for efficient querying and management of auctions, bids, and user information while maintaining the necessary relationships between these entities.

<br>

## 🔍 Conclusion

This document includes the ER diagram with clear relationships between User, AuctionItem, and Bid entities. It's integrated into the overall database schema and design decisions document, providing a comprehensive view of the database structure and the reasoning behind it.
