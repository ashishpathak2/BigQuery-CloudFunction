const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  // When running on Cloud Run / GCE the library auto-discovers credentials.
  // Locally it reads GOOGLE_APPLICATION_CREDENTIALS env variable.
});

const TOPIC_NAME = process.env.PUBSUB_TOPIC || 'purchase-events';

/**
 * Publish a purchase event to the Pub/Sub topic.
 * @param {Object} eventData
 * @returns {Promise<string>} messageId
 */
async function publishPurchaseEvent(eventData) {
  const topic = pubSubClient.topic(TOPIC_NAME);
  const dataBuffer = Buffer.from(JSON.stringify(eventData));

  const messageId = await topic.publishMessage({ data: dataBuffer });
  console.log(`📨  Published event to ${TOPIC_NAME}, messageId=${messageId}`);
  return messageId;
}

module.exports = { publishPurchaseEvent };
