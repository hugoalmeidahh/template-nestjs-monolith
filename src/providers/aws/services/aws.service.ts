import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import { Readable } from 'stream';
import { InternalProviderError } from '../../../errors/internal-provider.error';

@Injectable()
export class AwsService {
  private s3: S3;

  constructor(private config: ConfigService) {
    const awsEndpoint = this.config.get<string>('AWS_ENDPOINT_URL');
    this.s3 = new S3({
      region: this.config.getOrThrow<string>('AWS_REGION'),
      forcePathStyle: true,
      ...(awsEndpoint && { endpoint: awsEndpoint }),
    });
  }

  private async getFileFromKey(
    key: string,
  ): Promise<StreamingBlobPayloadOutputTypes> {
    const result = await this.s3.getObject({
      Bucket: this.config.getOrThrow<string>('AWS_S3_BUCKET'),
      Key: key,
    });

    if (!result.Body) {
      throw new InternalProviderError(`file ${key} not found`, 'aws s3');
    }

    return result.Body;
  }

  getKeyFromUrl(url: string) {
    const key = url.split('?')[0];
    const bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
    return key.substring(key.indexOf(bucket) + bucket.length + 1);
  }

  getSignedUrlToUpload(filePath: string, mimeType: string) {
    const settings = new PutObjectCommand({
      Bucket: this.config.getOrThrow<string>('AWS_S3_BUCKET'),
      Key: filePath,
      ContentType: mimeType,
    });
    return getSignedUrl(this.s3, settings, {
      expiresIn: Number(
        this.config.getOrThrow<number>('AWS_S3_URL_EXPIRES_IN_SECONDS'),
      ),
    });
  }

  async getFileTextFromKey(key: string): Promise<string> {
    const file = await this.getFileFromKey(key);
    const readableStream = Readable.fromWeb(file.transformToWebStream() as any);
    let fileContent = '';
    for await (const chunk of readableStream) {
      fileContent += chunk.toString();
    }
    return fileContent;
  }
}
