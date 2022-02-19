import { Schema, model, Types } from 'mongoose';

interface User {
    firstName: String;
    lastName: String;
    email: String;
    password: String;
    phone: Number;
    isActive: Boolean;
    isAdmin: Boolean;
    isOwner: Boolean;
    isWaiter: Boolean;
    isCustomer: Boolean;
    ordersStory: Types.ObjectId[];
    address: String;
    deviceToken?: String;
    tokenType?: String;
    coordinates?: Number[];
}

const scheme = new Schema<User>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isOwner: {
        type: Boolean,
        default: false
    },
    isWaiter: {
        type: Boolean,
        default: false
    },
    isCustomer: {
        type: Boolean,
        default: true,
    },
    ordersStory: [{
        type: Schema.Types.ObjectId,
        ref: 'Order',
        default: [],
    }],
    address: {
        type: String,
        required: true
    },
    deviceToken: {
        type: String,
        required: false
    },
    tokenType: {
        type: String,
        required: false
    },
    coordinates: {
        type: [Number],
        required: false
    }
});

scheme.post('save', function (error, _, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('El usuario ya existe.'));
    } else {
        next();
    }
});

export default model<User>('User', scheme);