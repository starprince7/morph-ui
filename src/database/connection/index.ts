import logger from '@/utils/logger';
import mongoose from 'mongoose';


class DatabaseConnection {
    private static instance: DatabaseConnection;
    private isConnected: boolean = false;
    private readonly mongoUrl: string;

    private constructor() {
        // Get MongoDB URL from environment variable or use default
        this.mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/morph-ui';
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async start(): Promise<void> {
        if (this.isConnected) {
            logger.info('Using existing database connection');
            return;
        }

        try {
            // Configure mongoose
            mongoose.set('strictQuery', true);

            // Configure mongoose options
            const options = {
                autoIndex: true, // Build indexes
                serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                family: 4, // Use IPv4, skip trying IPv6
            };

            // Ensure MongoDB URL is defined
            if (!this.mongoUrl) {
                throw new Error('MONGODB_URL environment variable is not defined');
            }

            // Connect to MongoDB
            await mongoose.connect(this.mongoUrl, options);
            this.isConnected = true;
            logger.info('Connected to MongoDB!');

            mongoose.connection.on('error', (err) => {
                logger.error('MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                logger.info('MongoDB disconnected');
                this.isConnected = false;
            });

            // Handle process termination
            process.on('SIGINT', async () => {
                await this.stop();
                process.exit(0);
            });

            logger.info('Successfully connected to MongoDB.');
            this.isConnected = true;
        } catch (error) {
            logger.error('Error connecting to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }

    public async stop(): Promise<void> {
        if (!this.isConnected) {
            logger.info('No database connection to close');
            return;
        }

        try {
            await mongoose.disconnect();
            logger.info('Database connection closed successfully');
            this.isConnected = false;
        } catch (error) {
            logger.error('Error closing database connection:', error);
            throw error;
        }
    }

    public getConnection(): mongoose.Connection {
        return mongoose.connection;
    }

    public isConnectedToDatabase(): boolean {
        return this.isConnected;
    }
}

// Export a singleton instance
export const db = DatabaseConnection.getInstance();

// Export type for the connection
export type DatabaseInstance = typeof db;