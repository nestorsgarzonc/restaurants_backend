import { Schema, model, Types } from 'mongoose';

interface paymentMethod {
    description: String;
    country: String;
    termsAndConditionsURL?: String;
    createdAt: Date;
    updatedAt: Date;
}

// Ver normas ISO de 2 bytes para identificar paises
export enum Countries{
    Colombia = 'CO',
    UnitedStates = 'US'
}

const schema = new Schema<paymentMethod>({
    description: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        enum: Countries
    },
    termsAndConditionsURL: {
        type: String,
        required: false
    }
}, { timestamps: true })


export default model<paymentMethod>('PaymentMethod', schema);