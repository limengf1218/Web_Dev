<br />
<div align="center">
  <a href="https://mikomiko.cc">
    <img src="media/logo.png" alt="MikoMiko Logo" width="120" height="auto">
  </a>
</div>

## Table of Content

- [Tech Stack](#tech-stack)
- [Local installation](#local-installation)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Important Scripts](#important-scripts)
- [Contributing](#contributing)

### Tech Stack

We've built this project using a combination of modern web technologies, including Next.js for the frontend, TRPC for the API, and Prisma + Postgres for the database. By leveraging these tools, we've been able to create a scalable and maintainable platform that is both user-friendly and powerful.

- **DB:** Prisma + Postgres
- **API:** tRPC
- **Front-end + Back-end:** NextJS
- **UI Kit:** [Mantine](https://mantine.dev/)
- **Storage:** Aliyun Cloud

## Local installation

To get a local copy up and running follow these simple example steps.

### Prerequisites

First, make sure that you have the following installed on your machine:
- Node.js (version 18 or later)
- Docker (for running the database)

> Recommend to installed `nvm` then install Node.js using `nvm` for node.js version control
> ```sh
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
> ```

### Installation

1. Clone the repository to your local machine.
1. Run `npm install` in the project directory to install the necessary dependencies. (during data migration step, hit ctrl + C when prompt to enter migration name if you have already done migration once.)
1. Spin up required services with `docker-compose -f docker-compose-local.yml up -d` for local.
    * Note: In addition to postgres and redis, this will also run maildev for email and minio for s3 storage with all necessary buckets automatically created, minio and maildev are not strictly needed but are preferred for testing and development purposes.
1. Create your `.env` file(copy from lark documents for respective enviroment). An example has been provided in `.env-example`.
    * Most default values are configured to work with the docker-compose setup, with the exception of the S3 upload key and secret. To generate those, navigate to the minio web interface at [http://localhost:9000](http://localhost:9000) with the default username and password `minioadmin`, and then navigate to the "Access Keys" tab. Click "Create Access Key" and copy the generated key and secret into the `.env` file.
    * `WEBHOOK_TOKEN` has been set to `1234`. This will be used to authenticate requests to the webhook endpoint.
### starting the Service
1. Start the development server by running `npm run dev`.
    * Alternatively, run `npm run build` followed by `pm2 start "npm start" --name mikomiko` to start the server in the background.
1. Finally, visit [http://localhost:3000](http://localhost:3000) to see the website.
    <!-- * Note that account creation will run emails through maildev, which can be accessed at [http://localhost:1080](http://localhost:1080). -->
    <!-- * Also note that Cloudflare credentials are necessary in order for image uploads to work. -->

### Important Scripts
```sh
docker-compose -f docker-compose-local.yml up -d # Spin up db, redis, maildev, and minio

npm run dev # Start the dev environment

npm run db:migrate -- --name migration-name # Create a database migration with prisma after updating the schema

npm run db:generate # Generates local prisma client

npm run db:ui # Start Prisma Studio to manage the database content

npm run build # Build the NextJS project

see more in package.json
```

## Contributing

Any contribution you make is **greatly appreciated**.



1. Create a new branch for your changes.
1. Make your changes to the code.
1. Commit your changes and push the branch.
1. Open a pull request to main branch.
1. After development delete the branch.

