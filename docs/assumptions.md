# Assumptions

- Customer soft delete is implemented via `isDeleted` flag.
- GST number is optional.
- Challan numbers use `CH-YYYY-####` format.
- Seed script uses idempotent `findOrCreate` where practical.
- Sequelize `sync()` is used for development convenience in this assignment scope.
