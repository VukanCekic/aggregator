import AWS from '../config/aws-config'

export class DynamoDBService {
  private readonly dynamodb: AWS.DynamoDB

 constructor() {
    if ((process.env.AWS_REGION == null) || (process.env.AWS_ACCESS_KEY_ID == null) || (process.env.AWS_SECRET_ACCESS_KEY == null)) {
      throw new Error('AWS credentials are missing. Make sure to set environment variables.')
    }
    this.dynamodb = new AWS.DynamoDB()
  }

   public async isConnected(): Promise<boolean> {
    try {
      await this.dynamodb.listTables().promise();
      return true;
    } catch (error) {
      console.error('Error connecting to DynamoDB:', error);
      return false;
    }
  }

  async putItem(
    params: AWS.DynamoDB.DocumentClient.PutItemInput
  ): Promise<void> {
    try {
      await this.dynamodb.putItem(params).promise()
    } catch (error) {
      console.error('Error putting item to DynamoDB:', error)
      throw error
    }
  }

  public async describeTable(
    tableName: string
  ): Promise<AWS.DynamoDB.DescribeTableOutput | null> {
    try {
      const data = await new Promise<AWS.DynamoDB.DescribeTableOutput | null>(
        (resolve, reject) => {
          this.dynamodb.describeTable(
            { TableName: tableName },
            (err: AWS.AWSError, data: AWS.DynamoDB.DescribeTableOutput) => {
              if (err !== null) {
                if (err.code === 'ResourceNotFoundException') {
                  resolve(null)
                } else {
                  reject(err)
                }
              } else {
                resolve(data)
              }
            }
          )
        }
      )
      return data
    } catch (error: unknown) {
      throw new Error(
        `Error describing the DynamoDB table: ${
          (error as AWS.AWSError).message
        }`
      )
    }
  }

  public async createTable(
    params: AWS.DynamoDB.CreateTableInput
  ): Promise<AWS.DynamoDB.CreateTableOutput> {
    try {
      const data = await new Promise<AWS.DynamoDB.CreateTableOutput>(
        (resolve, reject) => {
          this.dynamodb.createTable(
            params,
            (err: AWS.AWSError, data: AWS.DynamoDB.CreateTableOutput) => {
              if (err !== null) {
                reject(err)
              } else {
                resolve(data)
              }
            }
          )
        }
      )
      return data
    } catch (error: unknown) {
      throw new Error(
        `Error creating the DynamoDB table: ${(error as AWS.AWSError).message}`
      )
    }
  }

  public async deleteTable(
    tableName: string
  ): Promise<AWS.DynamoDB.DeleteTableOutput> {
    try {
      const data = await new Promise<AWS.DynamoDB.DeleteTableOutput>(
        (resolve, reject) => {
          this.dynamodb.deleteTable(
            { TableName: tableName },
            (err: AWS.AWSError, data: AWS.DynamoDB.DeleteTableOutput) => {
              if (err !== null) {
                reject(err)
              } else {
                resolve(data)
              }
            }
          )
        }
      )
      return data
    } catch (error: unknown) {
      throw new Error(
        `Error deleting the DynamoDB table: ${(error as AWS.AWSError).message}`
      )
    }
  }
}
