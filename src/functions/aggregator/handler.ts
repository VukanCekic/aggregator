import { type APIGatewayProxyEventV2 } from 'aws-lambda';
import AWS from 'aws-sdk';

const dynamoDBService = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  maxRetries: 3,
  retryDelayOptions: { base: 200 },
});

const fetchCompanies = async (): Promise<AWS.DynamoDB.DocumentClient.ScanOutput> => {
  return await dynamoDBService
    .scan({
      TableName: 'Company',
      ProjectionExpression: 'companyId, companyName',
    })
    .promise();
};

const fetchVulnerabilities = async (companyId: string):
 Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  return await dynamoDBService
    .query({
      TableName: 'Vulnerability',
      KeyConditionExpression: 'companyId = :companyId',
      ExpressionAttributeValues: { ':companyId': companyId },
    })
    .promise();
};

const fetchUserData = async (companyId: string):
Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  return await dynamoDBService
    .query({
      TableName: 'User',
      KeyConditionExpression: 'companyId = :companyId',
      ExpressionAttributeValues: { ':companyId': companyId },
      Select: 'COUNT',
    })
    .promise();
};

const calculateSeverityCounts = (vulnerabilities: AWS.DynamoDB.DocumentClient.ItemList):
AWS.DynamoDB.DocumentClient.AttributeMap => {
  return vulnerabilities.reduce((counts, vulnerability) => {
    const severity = vulnerability.severity;
    counts[severity] = (counts[severity] ?? 0) + 1;
    return counts;
  }, {});
};

  const calculateTopPackages = (vulnerabilities:AWS.DynamoDB.DocumentClient.ItemList):
  Record<string, any> => {
   const mostVulnerablePackages: { packages: Record<string, number> } = {
        packages: {}
    }

  vulnerabilities.forEach((vulnerability) => {
    const severity = vulnerability.severity;
    if (severity === 'critical' || severity === 'high') {
          const packageKey: string = vulnerability.packageName

        if (mostVulnerablePackages.packages[packageKey] === undefined) {
            mostVulnerablePackages.packages[packageKey] = 0
          }
          mostVulnerablePackages.packages[packageKey]++
    }
  });

  const sortedPackages = Object.keys(mostVulnerablePackages.packages ?? {})
        .sort(
          (a, b) =>
            mostVulnerablePackages.packages[b] -
            mostVulnerablePackages.packages[a]
        )
        .slice(0, 3)

  return sortedPackages.slice(0, 3).map((packageKey) => ({
    package: packageKey,
    count: mostVulnerablePackages.packages[packageKey]
  }));
};

const generateAggregatedData = (
  company: AWS.DynamoDB.DocumentClient.AttributeMap, 
  userData: AWS.DynamoDB.DocumentClient.QueryOutput,
  vulnerabilityData:AWS.DynamoDB.DocumentClient.QueryOutput):
  Record<string, any> => {
  const totalUsers = userData.Count ?? 0;
  const vulnerabilities = vulnerabilityData.Items ?? [];
  const severityCounts = calculateSeverityCounts(vulnerabilities);
  const topPackagesWithCounts = calculateTopPackages(vulnerabilities);

  return {
    createdAt: new Date().toISOString(),
    companyName: company.companyName,
    totalUsers,
    totalVulnerabilities: vulnerabilities.length,
    topPackagesWithCounts,
    severityCounts,
  };
};

export const aggregate = async (event: APIGatewayProxyEventV2): Promise<void> => {
  try {
    console.log('Aggregator function is running...');
    const companyList = await fetchCompanies();

    for (const company of companyList.Items ?? []) {
      const companyId: string = company.companyId;
      const vulnerabilityData = await fetchVulnerabilities(companyId);
      const userData = await fetchUserData(companyId);
      const aggregatedData = generateAggregatedData(company, userData, vulnerabilityData);

      const s3Params = {
        Bucket: 'software-vulnerability-aggregator-data-bucket',
        Key: `${companyId}/history/${new Date().toISOString().split('T')[0]}.json`,
        Body: JSON.stringify(aggregatedData),
      };

      await s3.putObject(s3Params).promise();
    }

    console.log('Aggregator function completed.');
  } catch (error) {
    console.error('Aggregator function error:', error);
  }
};
