import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { globalHeaders, toS3Key, getSessionId, createResponse, setRequestContext, logError } from "../helper/helper.js";
import redis from "../lib/redisClient.js";
import { createCacheKey } from "../lib/cacheKey.js";
import {
    DynamoDBClient,
    PutItemCommand
} from "@aws-sdk/client-dynamodb";
const dynamo = new DynamoDBClient({ region: process.env.region || 'eu-west-1' });
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: process.env.region || 'eu-west-1' });
const BUCKET_NAME = process.env.EMAIL_TEMPLATE_BUCKET

export const handler = async (event, context) => {
    setRequestContext(event, context);
    
    try {
        // --- Token Verification ---
        const body = JSON.parse(event.body || "{}");

        const requiredFields = [
            "templateName",
            "templateType",
            "templateContent",
            "templateDescription"
        ];

        const missingFields = requiredFields.filter(
            (field) => !body[field] || body[field].toString().trim() === ""
        );

        if (missingFields.length > 0) {
            return createResponse(400, {
                message: "Validation Error",
                missingFields
            });
        }

        const {
            templateName,
            templateType,
            templateContent,
            templateDescription
        } = body;

        const version = Date.now(); // simple version strategy
        const templateId = uuidv4();
        
        const s3Key = `${toS3Key(templateType)}/${toS3Key(templateName)}/v${version}.html`;

        // 1️⃣ Upload HTML to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: templateContent,
            ContentType: "text/html"
        });

        await s3.send(command);

        const templateContentUrl = `s3://${BUCKET_NAME}/${s3Key}`;

        // 2️⃣ Save metadata in DynamoDB
        const item = {
            PK: { S: `TEMPLATE#${templateName}` },
            SK: { S: `VERSION#${version}` },
            templateId: { S: templateId },
            templateName: { S: templateName },
            templateType: { S: templateType },
            templateDescription: { S: templateDescription },
            templateContentUrl: { S: templateContentUrl },
            version: { N: version.toString() },
            status: { N: "1" },
            createdAt: { S: new Date().toISOString() },
            updatedAt: { S: new Date().toISOString() }
        };

        await dynamo.send(
            new PutItemCommand({
                TableName: process.env.EMAIL_TEMPLATE_TABLE,
                Item: item
            })
        );
        return createResponse(201, {
            message: "Template created successfully",
            templateId,
            version
        });

    } catch (error) {
        console.error("Error in creating email templates", error.response?.data || error.message, error.stack);
        
        await logError(error, {
            function: 'createEmailTemplate',
            event: JSON.stringify(event)
        });
        
        return createResponse(500, {
            message: error.response?.data || "Internal Server Error",
            error: error.response?.data || error.message,
            stack: error.stack
        });
    }
};
