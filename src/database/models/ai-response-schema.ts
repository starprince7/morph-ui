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
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        index: true
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

// Compound indexes for efficient querying
aiResponseSchema.index({ apiEndpoint: 1, sessionId: 1 });
aiResponseSchema.index({ cacheKey: 1, apiEndpoint: 1 });
aiResponseSchema.index({ createdAt: -1 });

export default mongoose.models.AiResponse || mongoose.model<IAiResponse>("AiResponse", aiResponseSchema);
