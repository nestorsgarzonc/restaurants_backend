import { Schema, model, Types } from 'mongoose';

interface MenuItem{
    name: String;
    price: Number;
    imgUrl?: String;
}