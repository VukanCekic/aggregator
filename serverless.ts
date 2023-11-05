import type { AWS } from '@serverless/typescript';
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname,  '.env') })

const serverlessConfiguration: AWS = {
  org: 'vukanc',
  app: 'aggregator',
  service: 'aggregator',
  frameworkVersion: '3',
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    iam:{
        role:{
            statements: [
                  {
                    Effect: 'Allow',
                    Action: [
                      'dynamodb:Query',
                      'dynamodb:Scan',
                      'dynamodb:GetItem',
                    ],
                    Resource: [
                      `arn:aws:dynamodb:*:*:table/${process.env.COMPANY_TABLE}`,
                      `arn:aws:dynamodb:*:*:table/${process.env.USER_TABLE}`,
                      `arn:aws:dynamodb:*:*:table/${process.env.VULNERABILITY_TABLE}`,
                    ],
                  },
                  {
                    Effect: 'Allow',
                    Action: [
                      's3:GetObject',
                      's3:PutObject',
                    ],
                    Resource: `arn:aws:s3:::${process.env.S3_BUCKET_NAME}/*`,
                  },
                ],
        }
    }
  },
  plugins: [
    'serverless-offline',
    'serverless-plugin-typescript',
  ],
  functions: {
    companyData: {
      handler: 'src/functions/companyData/handler.getAggregatedData',
      url: true,
      events: [
        {
          httpApi: {
            path: '/getAggregatedData',
            method: 'get',
          },
        },
      ],
    },
    aggregator: {
      handler: './src/functions/aggregator/handler.aggregate',
      events: [
        {
          schedule: {
            name: 'dailyAggregationJob',
            description: 'Daily aggregation event',
            rate: ['cron(15 10 * * ? *)'],
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
