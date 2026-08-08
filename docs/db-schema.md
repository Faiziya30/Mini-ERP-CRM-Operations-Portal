# DB Schema (Sequelize + MySQL)

## Tables

1. users
2. customers
3. customer_followups
4. products
5. stock_movements
6. sales_challans
7. challan_items

## Relationships

- users (1) -> (many) customers via customers.createdBy
- customers (1) -> (many) customer_followups via customerId
- products (1) -> (many) stock_movements via productId
- customers (1) -> (many) sales_challans via customerId
- sales_challans (1) -> (many) challan_items via challanId
- products (1) -> (many) challan_items via productId

## Indexes

- users.email unique
- products.sku unique
- sales_challans.challanNumber unique
- searchable indexes on customers.name, customers.mobile, customers.businessName
