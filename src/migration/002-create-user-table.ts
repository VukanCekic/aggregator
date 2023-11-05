import MigrationBase from './abstract/migration'
import type AWS from '../config/aws-config'
import { DynamoDBService } from '../services/dynamo-db.service'
import fs from 'fs'
import path from 'path'

export class CreateUserTableMigration extends MigrationBase {
   private readonly dynamodbService: DynamoDBService;

  constructor() {
    super()
     this.dynamodbService = new DynamoDBService()
  }

  async up(): Promise<void> {
    const userTableParams: AWS.DynamoDB.CreateTableInput = {
      TableName: 'User',
      KeySchema: [
        { AttributeName: 'companyId', KeyType: 'HASH' },
        { AttributeName: 'userId', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'companyId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }

    const tableDescription = await this.dynamodbService.describeTable('User')
    if (tableDescription?.Table !== undefined) {
      console.log('Table "User" already exists. Skipping creation.')
      return
    }

    await this.dynamodbService.createTable(userTableParams)
    console.log('Creating User table...')
  }

  async down(): Promise<void> {
    await this.dynamodbService.deleteTable('User')
    console.log('Deleting User table...')
  }

  async seed(): Promise<void> {
    const filePath = path.join(__dirname, 'seed', 'seed-users.json')
    const seed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (seed.length > 0) {
      for (const item of seed) {
        await this.dynamodbService.putItem({
          TableName: 'User',
          Item: {
            companyId: { S: item.companyId },
            userId: { S: item.userId },
            email: { S: item.email },
            fullName: { S: item.fullName }
          }
        })
      }
      console.log('Seeding data into User table...')
    }
  }
}
