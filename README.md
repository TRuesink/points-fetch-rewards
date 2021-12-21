# Points Coding Exercise

This is a simple service for viewing, adding, and subtracting points from a database

## Installation

Clone the github repository to a local repository

```bash
git clone https://github.com/TRuesink/points-fetch-rewards.git
```

Navigate to the local repository folder and install dependencies

```bash
npm install
```

## Running the Development Server

Run the development server with the following command

```bash
npm run dev
```

## Initial Data

The in-memory database is initially populated with the following transactions:

```javascript
const database = [
  { payer: "DANNON", points: 1000, timestamp: "2020-11-02T14:00:00Z" },
  { payer: "UNILEVER", points: 200, timestamp: "2020-10-31T11:00:00Z" },
  { payer: "DANNON", points: -200, timestamp: "2020-10-31T15:00:00Z" },
  { payer: "MILLER COORS", points: 10000, timestamp: "2020-11-01T14:00:00Z" },
  { payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" },
];
```

## Making HTTP Requests

There are three endpoints users can consume:

- Retrieve point totals of every payer in the database
- Add a transaction
- Spend Points

[Detailed documentation and example requests can be found here](https://documenter.getpostman.com/view/13011637/UVRBn6dr).
