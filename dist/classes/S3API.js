"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3API = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Production-ready AWS S3 API wrapper for object storage operations
 */
class S3API {
    constructor(config) {
        if (!config.accessKeyId) {
            throw new Error('AWS Access Key ID is required');
        }
        if (!config.secretAccessKey) {
            throw new Error('AWS Secret Access Key is required');
        }
        if (!config.region) {
            throw new Error('AWS region is required');
        }
        if (!config.bucketName) {
            throw new Error('S3 bucket name is required');
        }
        this.accessKeyId = config.accessKeyId;
        this.secretAccessKey = config.secretAccessKey;
        this.region = config.region;
        this.bucketName = config.bucketName;
        this.sessionToken = config.sessionToken;
        this.baseUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
    }
    async request(method, key = '', data, headers = {}, queryParams = {}) {
        try {
            const url = new URL(`${this.baseUrl}/${encodeURIComponent(key).replace(/%2F/g, '/')}`);
            // Add query parameters
            Object.entries(queryParams).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    url.searchParams.set(k, v);
                }
            });
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
            const dateStamp = timestamp.slice(0, 8);
            // Prepare headers
            const requestHeaders = {
                'Host': url.host,
                'X-Amz-Date': timestamp,
                ...headers
            };
            if (this.sessionToken) {
                requestHeaders['X-Amz-Security-Token'] = this.sessionToken;
            }
            if (data && method !== 'GET' && method !== 'HEAD') {
                if (typeof data === 'string') {
                    requestHeaders['Content-Length'] = Buffer.byteLength(data, 'utf8').toString();
                }
                else {
                    requestHeaders['Content-Length'] = data.length.toString();
                }
            }
            // Generate signature
            const signature = this.generateSignature(method, url.pathname + url.search, requestHeaders, data || '', timestamp, dateStamp);
            requestHeaders['Authorization'] = signature;
            const response = await (0, axios_1.default)({
                method,
                url: url.toString(),
                data,
                headers: requestHeaders,
                timeout: 30000,
                validateStatus: (status) => status >= 200 && status < 400
            });
            return response;
        }
        catch (error) {
            this.handleS3Error(error);
            throw error;
        }
    }
    generateSignature(method, canonicalUri, headers, payload, timestamp, dateStamp) {
        // Create canonical request
        const sortedHeaders = Object.keys(headers)
            .sort()
            .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
            .join('\n');
        const signedHeaders = Object.keys(headers)
            .sort()
            .map(key => key.toLowerCase())
            .join(';');
        const payloadHash = crypto_1.default
            .createHash('sha256')
            .update(payload)
            .digest('hex');
        const canonicalRequest = [
            method,
            canonicalUri,
            '', // Canonical query string (handled in URL)
            sortedHeaders,
            '',
            signedHeaders,
            payloadHash
        ].join('\n');
        // Create string to sign
        const algorithm = 'AWS4-HMAC-SHA256';
        const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
        const stringToSign = [
            algorithm,
            timestamp,
            credentialScope,
            crypto_1.default.createHash('sha256').update(canonicalRequest).digest('hex')
        ].join('\n');
        // Calculate signature
        const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, 's3');
        const signature = crypto_1.default
            .createHmac('sha256', signingKey)
            .update(stringToSign)
            .digest('hex');
        // Create authorization header
        return `${algorithm} Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    }
    getSignatureKey(key, dateStamp, regionName, serviceName) {
        const kDate = crypto_1.default.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
        const kRegion = crypto_1.default.createHmac('sha256', kDate).update(regionName).digest();
        const kService = crypto_1.default.createHmac('sha256', kRegion).update(serviceName).digest();
        const kSigning = crypto_1.default.createHmac('sha256', kService).update('aws4_request').digest();
        return kSigning;
    }
    handleS3Error(error) {
        if (error.response?.data) {
            // Try to parse XML error response
            const errorData = error.response.data;
            if (typeof errorData === 'string' && errorData.includes('<Error>')) {
                const codeMatch = errorData.match(/<Code>(.*?)<\/Code>/);
                const messageMatch = errorData.match(/<Message>(.*?)<\/Message>/);
                const code = codeMatch ? codeMatch[1] : 'Unknown';
                const message = messageMatch ? messageMatch[1] : 'Unknown error';
                throw new Error(`S3 Error (${code}): ${message}`);
            }
        }
        if (error.response?.status) {
            throw new Error(`S3 API Error: HTTP ${error.response.status} - ${error.response.statusText}`);
        }
    }
    /**
     * Upload an object to S3
     */
    async uploadObject(key, data, options) {
        const headers = {};
        if (options?.contentType) {
            headers['Content-Type'] = options.contentType;
        }
        else {
            headers['Content-Type'] = this.guessContentType(key);
        }
        if (options?.cacheControl)
            headers['Cache-Control'] = options.cacheControl;
        if (options?.contentDisposition)
            headers['Content-Disposition'] = options.contentDisposition;
        if (options?.contentEncoding)
            headers['Content-Encoding'] = options.contentEncoding;
        if (options?.expires)
            headers['Expires'] = options.expires.toUTCString();
        if (options?.acl)
            headers['X-Amz-Acl'] = options.acl;
        if (options?.serverSideEncryption)
            headers['X-Amz-Server-Side-Encryption'] = options.serverSideEncryption;
        if (options?.storageClass)
            headers['X-Amz-Storage-Class'] = options.storageClass;
        // Add metadata headers
        if (options?.metadata) {
            Object.entries(options.metadata).forEach(([k, v]) => {
                headers[`X-Amz-Meta-${k}`] = v;
            });
        }
        const response = await this.request('PUT', key, typeof data === 'string' ? Buffer.from(data) : data, headers);
        return {
            location: `${this.baseUrl}/${key}`,
            bucket: this.bucketName,
            key,
            etag: response.headers.etag?.replace(/"/g, '') || '',
            versionId: response.headers['x-amz-version-id'],
            serverSideEncryption: response.headers['x-amz-server-side-encryption'],
            expiration: response.headers['x-amz-expiration']
        };
    }
    /**
     * Get an object from S3
     */
    async getObject(key, options) {
        const headers = {};
        if (options?.range)
            headers['Range'] = options.range;
        if (options?.ifMatch)
            headers['If-Match'] = options.ifMatch;
        if (options?.ifNoneMatch)
            headers['If-None-Match'] = options.ifNoneMatch;
        if (options?.ifModifiedSince)
            headers['If-Modified-Since'] = options.ifModifiedSince.toUTCString();
        if (options?.ifUnmodifiedSince)
            headers['If-Unmodified-Since'] = options.ifUnmodifiedSince.toUTCString();
        const queryParams = {};
        if (options?.responseContentType)
            queryParams['response-content-type'] = options.responseContentType;
        if (options?.responseContentLanguage)
            queryParams['response-content-language'] = options.responseContentLanguage;
        if (options?.responseExpires)
            queryParams['response-expires'] = options.responseExpires.toUTCString();
        if (options?.responseCacheControl)
            queryParams['response-cache-control'] = options.responseCacheControl;
        if (options?.responseContentDisposition)
            queryParams['response-content-disposition'] = options.responseContentDisposition;
        if (options?.responseContentEncoding)
            queryParams['response-content-encoding'] = options.responseContentEncoding;
        const response = await this.request('GET', key, undefined, headers, queryParams);
        // Extract metadata from response headers
        const metadata = {};
        Object.entries(response.headers).forEach(([headerKey, headerValue]) => {
            if (headerKey.toLowerCase().startsWith('x-amz-meta-')) {
                const metaKey = headerKey.substring(11); // Remove 'x-amz-meta-' prefix
                metadata[metaKey] = headerValue;
            }
        });
        return {
            body: response.data,
            contentType: response.headers['content-type'],
            contentLength: parseInt(response.headers['content-length'] || '0'),
            etag: response.headers.etag?.replace(/"/g, ''),
            lastModified: response.headers['last-modified'] ? new Date(response.headers['last-modified']) : undefined,
            metadata,
            versionId: response.headers['x-amz-version-id'],
            cacheControl: response.headers['cache-control'],
            contentDisposition: response.headers['content-disposition'],
            contentEncoding: response.headers['content-encoding'],
            contentLanguage: response.headers['content-language'],
            expires: response.headers.expires ? new Date(response.headers.expires) : undefined
        };
    }
    /**
     * Delete an object from S3
     */
    async deleteObject(key) {
        const response = await this.request('DELETE', key);
        return {
            deleteMarker: response.headers['x-amz-delete-marker'] === 'true',
            versionId: response.headers['x-amz-version-id']
        };
    }
    /**
     * List objects in the bucket
     */
    async listObjects(prefix, options) {
        const queryParams = {
            'list-type': '2'
        };
        if (prefix)
            queryParams.prefix = prefix;
        if (options?.delimiter)
            queryParams.delimiter = options.delimiter;
        if (options?.maxKeys)
            queryParams['max-keys'] = options.maxKeys.toString();
        if (options?.startAfter)
            queryParams['start-after'] = options.startAfter;
        if (options?.continuationToken)
            queryParams['continuation-token'] = options.continuationToken;
        const response = await this.request('GET', '', undefined, {}, queryParams);
        // Parse XML response
        return this.parseListObjectsResponse(response.data);
    }
    /**
     * Generate a pre-signed URL for direct client access
     */
    async generatePresignedUrl(key, operation, expiresIn, options) {
        const now = new Date();
        const expires = new Date(now.getTime() + expiresIn * 1000);
        const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
        const dateStamp = timestamp.slice(0, 8);
        const expiresTimestamp = Math.floor(expires.getTime() / 1000);
        const url = new URL(`${this.baseUrl}/${encodeURIComponent(key).replace(/%2F/g, '/')}`);
        // Add query parameters
        const queryParams = {
            'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
            'X-Amz-Credential': `${this.accessKeyId}/${dateStamp}/${this.region}/s3/aws4_request`,
            'X-Amz-Date': timestamp,
            'X-Amz-Expires': expiresIn.toString(),
            'X-Amz-SignedHeaders': 'host'
        };
        if (this.sessionToken) {
            queryParams['X-Amz-Security-Token'] = this.sessionToken;
        }
        if (options?.responseContentDisposition) {
            queryParams['response-content-disposition'] = options.responseContentDisposition;
        }
        if (options?.responseContentType) {
            queryParams['response-content-type'] = options.responseContentType;
        }
        Object.entries(queryParams).forEach(([k, v]) => {
            url.searchParams.set(k, v);
        });
        // Create string to sign
        const canonicalRequest = [
            operation,
            url.pathname,
            url.searchParams.toString(),
            'host:' + url.host,
            '',
            'host',
            'UNSIGNED-PAYLOAD'
        ].join('\n');
        const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
        const stringToSign = [
            'AWS4-HMAC-SHA256',
            timestamp,
            credentialScope,
            crypto_1.default.createHash('sha256').update(canonicalRequest).digest('hex')
        ].join('\n');
        const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, 's3');
        const signature = crypto_1.default
            .createHmac('sha256', signingKey)
            .update(stringToSign)
            .digest('hex');
        url.searchParams.set('X-Amz-Signature', signature);
        return url.toString();
    }
    /**
     * Copy an object within S3
     */
    async copyObject(sourceKey, destinationKey, options) {
        const headers = {
            'X-Amz-Copy-Source': `/${this.bucketName}/${encodeURIComponent(sourceKey).replace(/%2F/g, '/')}`
        };
        if (options?.metadataDirective)
            headers['X-Amz-Metadata-Directive'] = options.metadataDirective;
        if (options?.contentType)
            headers['Content-Type'] = options.contentType;
        if (options?.cacheControl)
            headers['Cache-Control'] = options.cacheControl;
        if (options?.contentDisposition)
            headers['Content-Disposition'] = options.contentDisposition;
        if (options?.contentEncoding)
            headers['Content-Encoding'] = options.contentEncoding;
        if (options?.expires)
            headers['Expires'] = options.expires.toUTCString();
        if (options?.acl)
            headers['X-Amz-Acl'] = options.acl;
        if (options?.serverSideEncryption)
            headers['X-Amz-Server-Side-Encryption'] = options.serverSideEncryption;
        if (options?.storageClass)
            headers['X-Amz-Storage-Class'] = options.storageClass;
        if (options?.metadata) {
            Object.entries(options.metadata).forEach(([k, v]) => {
                headers[`X-Amz-Meta-${k}`] = v;
            });
        }
        const response = await this.request('PUT', destinationKey, undefined, headers);
        // Parse copy result from XML response
        const copyResult = this.parseCopyResult(response.data);
        return {
            ...copyResult,
            versionId: response.headers['x-amz-version-id'],
            serverSideEncryption: response.headers['x-amz-server-side-encryption'],
            copySourceVersionId: response.headers['x-amz-copy-source-version-id']
        };
    }
    /**
     * Set object ACL
     */
    async setObjectAcl(key, acl) {
        const headers = {
            'X-Amz-Acl': acl
        };
        const queryParams = {
            'acl': ''
        };
        await this.request('PUT', key, undefined, headers, queryParams);
        // Return the ACL that was set (simplified)
        return {
            owner: {
                id: this.accessKeyId,
                displayName: 'Owner'
            },
            grants: [{
                    grantee: {
                        type: 'CanonicalUser',
                        id: this.accessKeyId,
                        displayName: 'Owner'
                    },
                    permission: 'FULL_CONTROL'
                }]
        };
    }
    /**
     * Check if object exists
     */
    async objectExists(key) {
        try {
            await this.request('HEAD', key);
            return true;
        }
        catch (error) {
            if (error.response?.status === 404) {
                return false;
            }
            throw error;
        }
    }
    /**
     * Get object metadata without downloading the object
     */
    async getObjectMetadata(key) {
        const response = await this.request('HEAD', key);
        const metadata = {};
        Object.entries(response.headers).forEach(([headerKey, headerValue]) => {
            if (headerKey.toLowerCase().startsWith('x-amz-meta-')) {
                const metaKey = headerKey.substring(11);
                metadata[metaKey] = headerValue;
            }
        });
        return {
            contentType: response.headers['content-type'],
            contentLength: parseInt(response.headers['content-length'] || '0'),
            etag: response.headers.etag?.replace(/"/g, ''),
            lastModified: response.headers['last-modified'] ? new Date(response.headers['last-modified']) : undefined,
            metadata,
            versionId: response.headers['x-amz-version-id'],
            cacheControl: response.headers['cache-control'],
            contentDisposition: response.headers['content-disposition'],
            contentEncoding: response.headers['content-encoding'],
            contentLanguage: response.headers['content-language'],
            expires: response.headers.expires ? new Date(response.headers.expires) : undefined
        };
    }
    /**
     * Guess content type based on file extension
     */
    guessContentType(key) {
        const extension = key.split('.').pop()?.toLowerCase();
        const mimeTypes = {
            'html': 'text/html',
            'htm': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json',
            'xml': 'application/xml',
            'txt': 'text/plain',
            'md': 'text/markdown',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'zip': 'application/zip',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav'
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    }
    /**
     * Parse XML list objects response
     */
    parseListObjectsResponse(xmlData) {
        // Simple XML parsing for list objects response
        // In production, consider using a proper XML parser
        const isTruncated = xmlData.includes('<IsTruncated>true</IsTruncated>');
        const keyCount = parseInt(xmlData.match(/<KeyCount>(\d+)<\/KeyCount>/)?.[1] || '0');
        const maxKeys = parseInt(xmlData.match(/<MaxKeys>(\d+)<\/MaxKeys>/)?.[1] || '1000');
        const name = xmlData.match(/<Name>(.*?)<\/Name>/)?.[1] || this.bucketName;
        const prefix = xmlData.match(/<Prefix>(.*?)<\/Prefix>/)?.[1];
        const delimiter = xmlData.match(/<Delimiter>(.*?)<\/Delimiter>/)?.[1];
        const nextContinuationToken = xmlData.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)?.[1];
        const continuationToken = xmlData.match(/<ContinuationToken>(.*?)<\/ContinuationToken>/)?.[1];
        const startAfter = xmlData.match(/<StartAfter>(.*?)<\/StartAfter>/)?.[1];
        // Extract objects
        const contents = [];
        const contentMatches = xmlData.match(/<Contents>([\s\S]*?)<\/Contents>/g);
        if (contentMatches) {
            contentMatches.forEach(contentXml => {
                const key = contentXml.match(/<Key>(.*?)<\/Key>/)?.[1];
                const lastModified = contentXml.match(/<LastModified>(.*?)<\/LastModified>/)?.[1];
                const etag = contentXml.match(/<ETag>(.*?)<\/ETag>/)?.[1]?.replace(/"/g, '');
                const size = parseInt(contentXml.match(/<Size>(\d+)<\/Size>/)?.[1] || '0');
                const storageClass = contentXml.match(/<StorageClass>(.*?)<\/StorageClass>/)?.[1] || 'STANDARD';
                if (key) {
                    contents.push({
                        key,
                        lastModified: lastModified ? new Date(lastModified) : new Date(),
                        etag: etag || '',
                        size,
                        storageClass
                    });
                }
            });
        }
        // Extract common prefixes
        const commonPrefixes = [];
        const prefixMatches = xmlData.match(/<CommonPrefixes>([\s\S]*?)<\/CommonPrefixes>/g);
        if (prefixMatches) {
            prefixMatches.forEach(prefixXml => {
                const commonPrefix = prefixXml.match(/<Prefix>(.*?)<\/Prefix>/)?.[1];
                if (commonPrefix) {
                    commonPrefixes.push(commonPrefix);
                }
            });
        }
        return {
            isTruncated,
            contents,
            name,
            prefix,
            delimiter,
            maxKeys,
            commonPrefixes: commonPrefixes.length > 0 ? commonPrefixes : undefined,
            keyCount,
            continuationToken,
            nextContinuationToken,
            startAfter
        };
    }
    /**
     * Parse copy result from XML response
     */
    parseCopyResult(xmlData) {
        const etag = xmlData.match(/<ETag>(.*?)<\/ETag>/)?.[1]?.replace(/"/g, '') || '';
        const lastModified = xmlData.match(/<LastModified>(.*?)<\/LastModified>/)?.[1];
        return {
            etag,
            lastModified: lastModified ? new Date(lastModified) : new Date()
        };
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            await this.listObjects('', { maxKeys: 1 });
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.S3API = S3API;
