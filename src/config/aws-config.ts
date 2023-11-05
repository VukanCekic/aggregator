import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

export default AWS
