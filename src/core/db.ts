import mongoose from 'mongoose';
import { dbUrl } from './config'


const initDB = async () => {
    const db = await mongoose.connect(
        dbUrl,
        {
        },
    );
    console.log(`Database is connected to: ${db.connection.name}`);
}

export default initDB;