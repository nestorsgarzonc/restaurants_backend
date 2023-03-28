import { Schema, model, Types } from 'mongoose';

interface Client {
    email: String;
    contacted: Boolean; 
    createdAt: Date;
    updatedAt: Date;
}

const scheme = new Schema<Client>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    contacted: {
        type: Boolean,
        required: false,
        default: false
    }
    
}, { timestamps: true });



export default model<Client>('Client', scheme);