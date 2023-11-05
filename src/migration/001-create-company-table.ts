import MigrationBase from './abstract/migration'
import type AWS from '../config/aws-config'
import { DynamoDBService } from '../services/dynamo-db.service'
import fs from 'fs'
import path from 'path'


export class CreateCompanyTableMigration extends MigrationBase {
  private readonly dynamodbService: DynamoDBService;

  constructor() {
    super()
     this.dynamodbService = new DynamoDBService()
  }

  async up(): Promise<void> {
    const companyTableParams: AWS.DynamoDB.CreateTableInput = {
      TableName: 'Company',
      KeySchema: [{ AttributeName: 'companyId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'companyId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }

    const tableDescription = await this.dynamodbService.describeTable('Company')
    if (tableDescription?.Table !== undefined) {
      console.log('Table "Company" already exists. Skipping creation.')
      return
    }

    await this.dynamodbService.createTable(companyTableParams)
    console.log('Creating Company table...')
  }

  async down(): Promise<void> {
    await this.dynamodbService.deleteTable('Company')
    console.log('Deleting Company table...')
  }

  async seed(): Promise<void> {
    const filePath = path.join(__dirname, 'seed', 'seed-companies.json')
    const seed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (seed.length > 0) {
      for (const item of seed) {
        await this.dynamodbService.putItem({
          TableName: 'Company',
          Item: {
            companyId: { S: item.companyId },
            companyName: { S: item.companyName }
          }
        })
      }
    }
  }
}
