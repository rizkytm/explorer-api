# Explorer API using Elysia with Bun runtime

## Getting Started
Install Dependencies (if counter error, try use node v22)
```bash
bun install
```

Copy Environment Variables and change username and password of database
```bash
cp .env.example .env
```

Run migrations
```bash
bunx prisma migrate dev
```

## Development
To start the development server run:
```bash
bun run dev
```

Swagger Url : http://localhost:3000/swagger

## Testing
Test Result: https://jam.dev/c/27c083e6-1b80-4188-a82a-1a866747b140

Open http://localhost:3000/ with your browser to see the result.