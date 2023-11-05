import AWS from './aws-config'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const s3 = new AWS.S3()

const createS3Bucket = async (
  bucketName = process.env.S3_BUCKET_NAME ??
    'software-vulnerability-aggregator-data-bucket'
): Promise<void> => {
  try {
    const createBucketParams = {
      Bucket: bucketName
    }
    await s3.createBucket(createBucketParams).promise()

    console.log(`arn:aws:s3:::${bucketName}`)
  } catch (error) {
    console.error('Error creating S3 bucket:', error)
    throw error
  }
}

void createS3Bucket()
