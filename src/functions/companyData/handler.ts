import { type APIGatewayProxyEventV2, type APIGatewayProxyResultV2 } from 'aws-lambda';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const getAggregatedData = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const companyId = event.queryStringParameters?.companyId;
    const date = event.queryStringParameters?.date;

    if (companyId === undefined || date === undefined) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Missing companyId or date parameters' }),
      };
    }

    const bucketName = 'software-vulnerability-aggregator-data-bucket';
    const key = `${companyId}/history/${date}.json`;

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const data = await s3.getObject(params).promise();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const decodedData = data.Body !==undefined ? data.Body.toString('utf-8') :  `No data found for ${companyId} on ${date}`;
    const formattedData = JSON.stringify(JSON.parse(decodedData), null, 2);

    console.log(data);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(formattedData),
    };
  } catch (error) {
    console.error('Error retrieving aggregated data:', error);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Error retrieving aggregated data for Date and CompanyId'}),
    };
  }
};
