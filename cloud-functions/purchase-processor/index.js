const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;   // auto-set by Cloud Functions
const DATASET    = process.env.BIGQUERY_DATASET || 'ecommerce_analytics';
const TABLE      = process.env.BIGQUERY_TABLE   || 'purchases';

/**
 * Cloud Function triggered by Pub/Sub.
 * Receives a purchase event and inserts it into BigQuery.
 *
 * @param {object} message   Pub/Sub message object
 * @param {object} context   Cloud Function context
 */
exports.processPurchaseEvent = async (message, context) => {
  console.log('📩  Pub/Sub message received:', context.eventId);

  let eventData;
  try {
    const rawData = message.data
      ? Buffer.from(message.data, 'base64').toString()
      : '{}';
    eventData = JSON.parse(rawData);
    console.log('Parsed event:', JSON.stringify(eventData));
  } catch (err) {
    console.error('❌  Failed to parse Pub/Sub message:', err);
    return; // ACK the message so it is not retried forever
  }

  // ── Validate required fields ──────────────────────────────
  const { user_id, product_id, price, city, timestamp } = eventData;
  if (!user_id || !product_id || !price || !city) {
    console.error('❌  Missing required fields in event:', eventData);
    return;
  }

  // ── Build BigQuery row ─────────────────────────────────────
  const row = {
    user_id:    parseInt(user_id),
    product_id: parseInt(product_id),
    price:      parseFloat(price),
    city:       String(city),
    timestamp:  timestamp || new Date().toISOString(),
  };

  // ── Insert into BigQuery ───────────────────────────────────
  try {
    await bigquery
      .dataset(DATASET)
      .table(TABLE)
      .insert([row]);

    console.log(`✅  Inserted row into ${PROJECT_ID}.${DATASET}.${TABLE}:`, row);
  } catch (err) {
    // BigQuery insert errors are wrapped in err.errors array
    if (err.name === 'PartialFailureError') {
      console.error('❌  BigQuery partial failure:', JSON.stringify(err.errors));
    } else {
      console.error('❌  BigQuery insert error:', err);
    }
    throw err; // rethrow to trigger Pub/Sub retry
  }
};
