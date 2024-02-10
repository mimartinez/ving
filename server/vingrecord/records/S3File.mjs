import { VingRecord, VingKind } from "../VingRecord.mjs";
import { useDB } from '../../drizzle/db.mjs';
import { S3FileTable } from '../../drizzle/schema/S3File.mjs';
import { useUsers } from './User.mjs';
import { v4 } from 'uuid';
import sanitize from 'sanitize-filename';
import * as dotenv from 'dotenv';
dotenv.config();

export const sanitizeFilename = sanitize;

export const formatS3FolderName = (input) => {
    return input.replace(/-/g, '/').replace(/^(.{4})(.+)$/, '$1/$2')
}

export const makeS3FolderName = () => {
    return formatS3FolderName(v4());
}

export class S3FileRecord extends VingRecord {

    get fileUrl() {
        return `https://${process.env.AWS_FILES_BUCKET}.s3.amazonaws.com/${this.s3folder}/${this.filename}`;
    }

    get thumbnailUrl() {
        switch (this.get('icon')) {
            case 'self':
                return this.fileUrl();
            case 'thumbnail':
                return `https://${process.env.AWS_THUMBNAILS_BUCKET}.s3.amazonaws.com/${formatS3FolderName(this.get('id'))}.png`;
            case 'extension': {
                const extmap = {
                    mp3: 'audio',
                    wav: 'audio',
                    js: 'code',
                    ts: 'code',
                    pl: 'code',
                    mjs: 'code',
                    cjs: 'code',
                    yaml: 'config',
                    json: 'config',
                    ini: 'config',
                    config: 'config',
                    css: 'config',
                    rtf: 'document',
                    pdf: 'document',
                    doc: 'document',
                    docx: 'document',
                    pages: 'document',
                    odt: 'document',
                    ttf: 'font',
                    otf: 'font',
                    tif: 'image',
                    tiff: 'image',
                    psd: 'image',
                    bmp: 'image',
                    xml: 'markup',
                    html: 'markup',
                    php: 'markup',
                    njk: 'markup',
                    ppt: 'presentation',
                    odp: 'presentation',
                    keynote: 'presentation',
                    xls: 'spreadsheet',
                    csv: 'spreadsheet',
                    xlsx: 'spreadsheet',
                    ods: 'spreadsheet',
                    md: 'text',
                    txt: 'text',
                    svg: 'vector',
                    ai: 'vector',
                    ps: 'vector',
                    mp4: 'video',
                    mov: 'video',
                    avi: 'video',
                    gif: 'video',
                    zip: 'archive',
                    rar: 'archive',
                    gz: 'archive',
                    tar: 'archive',
                    exe: 'disc',
                    dmg: 'disc',
                    msi: 'disc',
                };
                const image = extmap[this.extension] || 'unknown';
                return `/img/filetype/${image}.png`;
            }
            default:
                return '/img/pending.webp';
        }
    }

    get extension() {
        const match = this.get('filename').toLowerCase().match(/^.*\.(\w*)$/);
        return match[1];
    }

    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            if (this.isOwner(params?.currentUser)) {
                out.meta.fileUrl = this.fileUrl;
            }
            out.meta.thumbnailUrl = this.thumbnailUrl;
            out.meta.extension = this.extension;
        }
        return out;
    }

    // User - parent relationship
    get user() {
        return useUsers().findOrDie(this.get('userId'));
    }

}

export class S3FileKind extends VingKind {
    // add custom Kind code here
}

export const useS3Files = () => {
    return new S3FileKind(useDB(), S3FileTable, S3FileRecord);
}