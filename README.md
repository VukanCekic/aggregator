# README

## Project Overview

This project is a vulnerability aggregator that fetches data from different companies and calculates the severity counts and top packages with vulnerabilities.

## Prerequisites

- Node.js
- AWS SDK
- TypeScript


- AWS CLI setup. Run `aws configure` on your machine and set the following environment variables in your .env file:
    ```
    AWS_ACCESS_KEY_ID="xxxx"
    AWS_SECRET_ACCESS_KEY="xxxx"
    AWS_REGION="xxxx"
    ```

## Running the Project
0. Ensure that the AWS CLI is set up and the environment variables are correctly set in your .env file.

- Serverless Framework installed globally. You can install it using the following command:
    ```
    npm install -g serverless
    ```

1. Install the dependencies:
    ```
    npm install
    ```
2. Create an S3 bucket:
    ```
    npm run create-s3-bucket
    ```
    After running this command, an S3 bucket will be created. The name of the bucket will be logged in the console. You can either add this bucket name to your .env file or specify it before running the command.
    

3. Set up DynamoDB:
    ```
    npm run migrate-up
    npm run migrate-seed
    ```
    These commands will set up your DynamoDB tables and seed them with initial data.

4. Run the project:
    ```
    npm run dev
    ```
    ```
5. Run the aggregator function:
    ```
    serverless invoke local -f aggregator
    ```
    After running this command, you can check the S3 bucket on AWS for the result.

6. Test the API function locally:
    ```
    npm run dev
    ```
    After running this command, you can test the API function:
    ```
    http://localhost:3000/getAggregatedData?companyId=36a861e0-7ad2-48b0-952e-3b86b2432c65&date=2023-11-04
    ```
    The result should be similar to the following:
    ```
    {
      "createdAt": "2023-11-04T23:16:46.601Z",
      "companyName": "Company A",
      "totalUsers": 2,
      "totalVulnerabilities": 30,
      "topPackagesWithCounts": [
        {
          "package": "express",
          "count": 7
        },
        {
          "package": "angular",
          "count": 6
        },
        {
          "package": "react",
          "count": 2
        }
      ],
      "severityCounts": {
        "critical": 10,
        "high": 10,
        "medium": 5,
        "low": 5
      }
    }

6. Deploy the project:
    ```
    serverless deploy
    ```
    This command will deploy your project to AWS using Serverless.


## Project Architecture and Design Choices

This project uses a serverless architecture, leveraging AWS services like S3 and DynamoDB. The choice of a serverless architecture was made to ensure scalability, high availability, and cost-effectiveness.

The application is written in TypeScript, a statically typed superset of JavaScript, providing the benefits of type safety and improved developer tooling.

AWS S3 is used for storing large amounts of unstructured data. This choice was made due to S3's durability, scalability, and security features.

AWS DynamoDB is used as the primary database for this application. DynamoDB is a NoSQL database service that supports key-value and document data structures. It was chosen for its performance at scale, with single-digit millisecond response times.

The application uses the AWS SDK to interact with AWS services. The AWS SDK provides an efficient, easy-to-use interface to AWS services.

The Serverless Framework is used to manage the deployment of the application. It provides a simple, declarative way of defining resources and has good integration with AWS services.

The project uses eslint and prettier for linting and formatting. This helps maintain a consistent code style and catch potential bugs early.

## Future Improvements

While this project provides a solid foundation, there is always room for improvement. Some potential areas for enhancement include:

- **Secondary Global Indexes**: Implementing secondary global indexes in DynamoDB could improve the performance of certain query operations.

- **Testing**: While basic unit tests are included, the test coverage could be expanded. Integration tests and end-to-end tests could also be added to ensure the system works as expected from a user's perspective.

- **Logging and Monitoring**: Integration with AWS CloudWatch could provide valuable insights into the application's performance and usage. This could help identify potential issues before they impact users.

- **Additional Features**: Depending on the specific needs of the users, additional features could be added to the application.

Please note that this is a timed project, and as such, the current version focuses on providing a solid base with the intention of future improvements.
