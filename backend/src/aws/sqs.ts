import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL!;

export async function enqueueDocumentProcessing(
  projectId: string,
  documentKey: string,
) {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        type: "PROCESS_DOCUMENT",
        projectId,
        documentKey,
        timestamp: new Date().toISOString(),
      }),
      MessageGroupId: projectId,
      MessageDeduplicationId: `${projectId}-${Date.now()}`,
    }),
  );
}

export async function processQueue() {
  const { Messages } = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    }),
  );

  for (const msg of Messages ?? []) {
    try {
      const body = JSON.parse(msg.Body!);
      console.log("[SQS] Processing:", body.type, body.documentKey);

      // TODO: implement diagram upload to s3 and create a db column that appends s3 keys associated with project

      // Only delete AFTER successful processing
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle!,
        }),
      );
    } catch (err) {
      console.error("[SQS] Processing failed, will retry:", err);
    }
  }
}
