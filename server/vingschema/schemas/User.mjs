import { baseSchemaProps, dbString, zodString, dbEnum, dbBoolean, dbRelation } from '../helpers.mjs';

export const userSchema = {
    kind: 'User',
    tableName: 'users',
    owner: ['$id', 'admin'],
    props: [
        ...baseSchemaProps,
        {
            type: "string",
            name: "username",
            required: true,
            filterQuery: true,
            unique: true,
            length: 60,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: "email",
            required: true,
            filterQuery: true,
            unique: true,
            length: 256,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop).email(),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: "realName",
            required: true,
            filterQuery: true,
            length: 60,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: "password",
            length: 256,
            required: false,
            default: 'no-password-specified',
            db: (prop) => dbString(prop),
            view: [],
            edit: [],
        },
        {
            type: "enum",
            name: "passwordType",
            required: false,
            length: 20,
            default: 'bcrypt',
            db: (prop) => dbEnum(prop),
            enums: ['bcrypt'],
            enumLabels: ['Bcrypt'],
            view: [],
            edit: [],
        },
        {
            type: "enum",
            name: 'useAsDisplayName',
            required: true,
            length: 20,
            default: 'username',
            db: (prop) => dbEnum(prop),
            enums: ['username', 'email', 'realName'],
            enumLabels: ['Username', 'Email Address', 'Real Name'],
            view: [],
            edit: ['owner'],
        },
        {
            type: "boolean",
            name: 'verifiedEmail',
            required: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Verified', 'Not Yet Verified'],
            view: ['owner'],
            edit: ['admin'],
        },
        {
            type: "boolean",
            name: 'admin',
            required: true,
            filterQualifier: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not Admin', 'Admin'],
            view: ['owner'],
            edit: ['admin'],
        },
        {
            type: "boolean",
            name: 'developer',
            required: true,
            filterQualifier: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not a Software Developer', 'Software Developer'],
            view: [],
            edit: ['owner'],
        },
        {
            type: "enum",
            name: 'avatarType',
            required: true,
            length: 20,
            default: 'robot',
            db: (prop) => dbEnum(prop),
            enums: ['robot', 'uploaded'],
            enumLabels: ['Robot', 'Uploaded'],
            view: [],
            edit: ['owner'],
        },
        {
            type: "id",
            name: 'avatarId',
            required: false,
            length: 36,
            db: (prop) => dbRelation(prop),
            relation: {
                type: 'parent',
                name: 'avatar',
                kind: 'S3File',
            },
            default: null,
            view: ['public'],
            edit: ['owner'],
        },
        {
            type: "virtual",
            name: 'apikeys',
            required: false,
            view: ['public'],
            edit: [],
            relation: {
                type: 'child',
                name: 'apikeys',
                kind: 'APIKey',
            },
        },
        {
            type: "virtual",
            name: 's3files',
            required: false,
            view: ['public'],
            edit: [],
            relation: {
                type: 'child',
                name: 's3files',
                kind: 'S3File',
            },
        },
    ],
};

export const RoleOptions = ["admin", "developer", "verifiedEmail"];