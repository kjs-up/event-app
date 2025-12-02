"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDataSource = exports.initializeDataSource = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path = __importStar(require("path"));
(0, dotenv_1.config)({ path: path.resolve(__dirname, "../../.env.local") });
(0, dotenv_1.config)({ path: path.resolve(__dirname, "../../.env") });
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USERNAME || "eventuser",
    password: process.env.DATABASE_PASSWORD || "eventpass",
    database: process.env.DATABASE_NAME || "eventdb",
    schema: process.env.DATABASE_SCHEMA || "public",
    synchronize: false,
    logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    entities: [
        path.join(__dirname, "../types/entities/**/*.{ts,js}"),
    ],
    migrations: [
        path.join(__dirname, "migrations/**/*.{ts,js}"),
    ],
    subscribers: [
        path.join(__dirname, "subscribers/**/*.{ts,js}"),
    ],
    extra: {
        max: parseInt(process.env.DATABASE_POOL_MAX || "10"),
        min: parseInt(process.env.DATABASE_POOL_MIN || "2"),
        connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "30000"),
        idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || "60000"),
    },
    ssl: process.env.NODE_ENV === "production" ? {
        rejectUnauthorized: false
    } : false,
});
const initializeDataSource = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            console.log("Database connection initialized successfully");
        }
        return exports.AppDataSource;
    }
    catch (error) {
        console.error("Error during Data Source initialization", error);
        throw error;
    }
};
exports.initializeDataSource = initializeDataSource;
const closeDataSource = async () => {
    try {
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
            console.log("Database connection closed successfully");
        }
    }
    catch (error) {
        console.error("Error during Data Source closing", error);
        throw error;
    }
};
exports.closeDataSource = closeDataSource;
//# sourceMappingURL=data-source.js.map