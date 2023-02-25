import { Schema, model, Types } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

interface Restaurant {
    address:           String;
    createdAt:         Date;
    description:       String;
    email:             String;
    image?:            String;
    logo?:             String;
    menu:              Types.ObjectId[];
    name:              String;
    owner:             Types.ObjectId;
    phone:             Number;
    weekDays:          Object[];
    paymentMethods:    Types.ObjectId[];
    primaryColor?:     String;
    secondaryColor?:   String;
    facebook?:         String;
    instagram?:        String
    tables:            Types.ObjectId[];
    updatedAt:         Date;
    waiters:           Types.ObjectId[];
    cashiers:          Types.ObjectId[];
    chefs:             Types.ObjectId[];
}

const schema = new Schema<Restaurant>({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    primaryColor: {
        type: String,
    },
    secondaryColor: {
        type: String,
    },
    facebook:{
        type: String,
        required: false
    },
    instagram:{
        type: String,
        required: false
    },
    weekDays:[{
        type: Object,
        required:true
    }],
    paymentMethods:[{
        type: Schema.Types.ObjectId,
        ref: 'PaymentMethod',
        required: true
    }],
    image: {
        type: String,
        required: false
    },
    logo:{
        type: String,
        required: false
    },
    menu: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: [],
        required: false
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tables: [{
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: false,
        default: []
    }],
    waiters: [{
        type: Schema.Types.ObjectId,
        ref: 'Waiter',
        required: false,
        default: []
    }],
    cashiers: [{
        type: Schema.Types.ObjectId,
        ref: 'Cashier',
        required: false,
        default: []
    }],
    chefs: [{
        type: Schema.Types.ObjectId,
        ref: 'Chef',
        required: false,
        default: []
    }]
}, { timestamps: true })



export default model<Restaurant>('Restaurant', schema);