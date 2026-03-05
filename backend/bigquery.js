const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const DATASET = process.env.BIGQUERY_DATASET || 'ecommerce_analytics';
const TABLE   = process.env.BIGQUERY_TABLE   || 'purchases';
const FULL_TABLE = `\`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${DATASET}.${TABLE}\``;

/**
 * Run a BigQuery SQL query and return rows.
 */
async function runQuery(sql) {
  const [rows] = await bigquery.query({ query: sql, location: 'US' });
  return rows;
}

module.exports = { bigquery, DATASET, TABLE, FULL_TABLE, runQuery };
