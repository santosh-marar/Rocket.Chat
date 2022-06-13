import type { IRocketChatRecord } from './IRocketChatRecord';

export interface IUpload extends IRocketChatRecord {
	typeGroup?: string;
	type?: string;
	name: string;
	aliases?: string;
	extension?: string;
	complete?: boolean;
	rid?: string;
	store: string;
	uploading?: boolean;
	userId?: string;
	progress?: number;
	etag?: string;
	size: number;

	uploadedAt: Date;
}
