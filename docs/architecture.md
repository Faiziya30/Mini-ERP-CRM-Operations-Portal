# Architecture Overview

## Backend MVC Pattern

Request flow:

Client -> Route -> Validation Middleware -> Auth/Role Middleware -> Controller -> Service -> Model (Sequelize) -> MySQL

## Key Conventions

- Routes are thin: no business logic.
- Controllers orchestrate request/response only.
- Services hold business logic and transaction-sensitive flows.
- Models define schema, constraints, and associations.

## Transaction Safety Plan

- Product stock adjustments will run in DB transactions.
- Challan confirm/cancel will run atomically:
  - Validate all item stocks first
  - Deduct/revert stock and movement logs together
  - Roll back full operation on any failure
