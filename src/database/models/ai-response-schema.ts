import { AIComponentResponse } from "@/lib/types";
import mongoose from "mongoose";

export interface IAiResponse {
    apiEndpoint: string;
    sessionId?: string;
    cacheKey: string;
    aiResponse: AIComponentResponse;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    accessCount: number;
    lastAccessedAt: Date;
}

const aiResponseSchema = new mongoose.Schema<IAiResponse>({
    apiEndpoint: {
        type: String,
        required: true
    },
    sessionId: {
        type: String
    },
    cacheKey: {
        type: String,
        required: true,
        index: true
    },
    aiResponse: {
        success: Boolean,
        component: String,
        componentName: String,
        error: String,
        metadata: {
            generatedAt: String,
            dataSource: String,
            cacheKey: String,
        },
    },
    accessCount: {
        type: Number,
        default: 0
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    }
}, {
    timestamps: true,
    collection: 'ai_responses'
});

// Unique index on apiEndpoint for global caching across all users
aiResponseSchema.index({ apiEndpoint: 1 }, { unique: true });
// Additional indexes for performance
aiResponseSchema.index({ createdAt: -1 });
aiResponseSchema.index({ sessionId: 1 }); // For session-based queries if needed

export default mongoose.models.AiResponse || mongoose.model<IAiResponse>("AiResponse", aiResponseSchema);
