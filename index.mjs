import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Response } from 'node-fetch';
export const handler = async (event) => {
    const s3Client = new S3Client({ region: "us-west-2" });

    const params = {
        Key: 'images.json',
        Bucket: 'justin-lab17-images',
    };

    let imgjson;
    try {
        let s3Results = await s3Client.send(new GetObjectCommand(params));
        const response = new Response(s3Results.Body);
        imgjson = await response.json();

        if (!imgjson) {
            throw new Error('Need to create images.json');
        }
        else {
            imgjson.images.forEach(image => {
                if (image.name === event.Records[0].object.name) {
                    let updateParams = {
                        Key: 'images.json',
                        Bucket: 'justin-lab17-images',
                        Body: {
                            "name": event.Records[0].object.name,
                            "size": event.Records[0].object.size,
                            "type": event.Records[0].object.type
                        }
                    }
                    let command = new PutObjectCommand(updateParams);
                    return s3Client.send(command);
                }

            });

        }
    }
    catch (e) {
        console.log('handler event', JSON.stringify(event, e));
        imgjson = {
            "images": [
                {
                    "name": event.Records[0].object.name,
                    "size": event.Records[0].object.size,
                    "type": event.Records[0].object.type
                }
            ]
        }

    }

    const response = {
        statusCode: 200,
        body: imgjson,
    };
    return response;
};
