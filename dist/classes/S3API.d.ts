/// <reference types="node" />
/// <reference types="node" />
export interface S3Config {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
    sessionToken?: string;
}
export interface UploadOptions {
    contentType?: string;
    metadata?: Record<string, string>;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    expires?: Date;
    acl?: ObjectAcl;
    serverSideEncryption?: 'AES256' | 'aws:kms';
    storageClass?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'STANDARD_IA' | 'ONEZONE_IA' | 'INTELLIGENT_TIERING' | 'GLACIER' | 'DEEP_ARCHIVE';
}
export interface GetOptions {
    range?: string;
    ifMatch?: string;
    ifNoneMatch?: string;
    ifModifiedSince?: Date;
    ifUnmodifiedSince?: Date;
    responseContentType?: string;
    responseContentLanguage?: string;
    responseExpires?: Date;
    responseCacheControl?: string;
    responseContentDisposition?: string;
    responseContentEncoding?: string;
}
export interface ListOptions {
    prefix?: string;
    delimiter?: string;
    maxKeys?: number;
    startAfter?: string;
    continuationToken?: string;
}
export interface CopyOptions {
    metadata?: Record<string, string>;
    metadataDirective?: 'COPY' | 'REPLACE';
    contentType?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    expires?: Date;
    acl?: ObjectAcl;
    serverSideEncryption?: 'AES256' | 'aws:kms';
    storageClass?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'STANDARD_IA' | 'ONEZONE_IA' | 'INTELLIGENT_TIERING' | 'GLACIER' | 'DEEP_ARCHIVE';
}
export type ObjectAcl = 'private' | 'public-read' | 'public-read-write' | 'authenticated-read' | 'aws-exec-read' | 'bucket-owner-read' | 'bucket-owner-full-control';
export interface UploadResult {
    location: string;
    bucket: string;
    key: string;
    etag: string;
    versionId?: string;
    serverSideEncryption?: string;
    expiration?: string;
}
export interface S3Object {
    body: Buffer;
    contentType?: string;
    contentLength?: number;
    etag?: string;
    lastModified?: Date;
    metadata?: Record<string, string>;
    versionId?: string;
    cacheControl?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLanguage?: string;
    expires?: Date;
}
export interface S3ObjectInfo {
    key: string;
    lastModified: Date;
    etag: string;
    size: number;
    storageClass: string;
    owner?: {
        id: string;
        displayName: string;
    };
}
export interface S3ObjectList {
    isTruncated: boolean;
    contents: S3ObjectInfo[];
    name: string;
    prefix?: string;
    delimiter?: string;
    maxKeys: number;
    commonPrefixes?: string[];
    encodingType?: string;
    keyCount: number;
    continuationToken?: string;
    nextContinuationToken?: string;
    startAfter?: string;
}
export interface DeleteResult {
    deleteMarker?: boolean;
    versionId?: string;
}
export interface CopyResult {
    etag: string;
    lastModified: Date;
    versionId?: string;
    serverSideEncryption?: string;
    copySourceVersionId?: string;
}
export interface AclResult {
    owner: {
        id: string;
        displayName: string;
    };
    grants: Array<{
        grantee: {
            type: 'CanonicalUser' | 'AmazonCustomerByEmail' | 'Group';
            id?: string;
            displayName?: string;
            emailAddress?: string;
            uri?: string;
        };
        permission: 'FULL_CONTROL' | 'WRITE' | 'WRITE_ACP' | 'READ' | 'READ_ACP';
    }>;
}
/**
 * Production-ready AWS S3 API wrapper for object storage operations
 */
export declare class S3API {
    private readonly accessKeyId;
    private readonly secretAccessKey;
    private readonly region;
    private readonly bucketName;
    private readonly sessionToken?;
    private readonly baseUrl;
    constructor(config: S3Config);
    private request;
    private generateSignature;
    private getSignatureKey;
    private handleS3Error;
    /**
     * Upload an object to S3
     */
    uploadObject(key: string, data: Buffer | string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Get an object from S3
     */
    getObject(key: string, options?: GetOptions): Promise<S3Object>;
    /**
     * Delete an object from S3
     */
    deleteObject(key: string): Promise<DeleteResult>;
    /**
     * List objects in the bucket
     */
    listObjects(prefix?: string, options?: ListOptions): Promise<S3ObjectList>;
    /**
     * Generate a pre-signed URL for direct client access
     */
    generatePresignedUrl(key: string, operation: 'GET' | 'PUT', expiresIn: number, options?: {
        contentType?: string;
        responseContentDisposition?: string;
        responseContentType?: string;
    }): Promise<string>;
    /**
     * Copy an object within S3
     */
    copyObject(sourceKey: string, destinationKey: string, options?: CopyOptions): Promise<CopyResult>;
    /**
     * Set object ACL
     */
    setObjectAcl(key: string, acl: ObjectAcl): Promise<AclResult>;
    /**
     * Check if object exists
     */
    objectExists(key: string): Promise<boolean>;
    /**
     * Get object metadata without downloading the object
     */
    getObjectMetadata(key: string): Promise<Omit<S3Object, 'body'>>;
    /**
     * Guess content type based on file extension
     */
    private guessContentType;
    /**
     * Parse XML list objects response
     */
    private parseListObjectsResponse;
    /**
     * Parse copy result from XML response
     */
    private parseCopyResult;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
}
