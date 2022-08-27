import mongoose from 'mongoose';


const initDB = async () => {
    const db = await mongoose.connect(
        process.env.MONGO_URI,
        {
        },
    );
    console.log(`Database is connected to: ${db.connection.name}`);
}

export default initDB;