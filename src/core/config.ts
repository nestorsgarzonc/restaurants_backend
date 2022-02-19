import { config } from 'dotenv';

config();

//= =====================
// Port
//= =====================

process.env.PORT = process.env.PORT || '3000';

//= =====================
// Entorno
//= =====================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//= =====================
// Vencimiento token
//= =====================
process.env.TOKEN_DURATION = process.env.TOKEN_DURATION || '7d';

//= =====================
// Seed autenticacion
//= =====================
process.env.SEED = process.env.SEED || 'dev_secret_seed';

//= =====================
// DB
//= =====================

let urlDB;
//if (process.env.NODE_ENV === 'dev') {
//    urlDB = 'mongodb://localhost/waffly_test';
//} else {
//    urlDB = process.env.MONGO_URI;
//}

urlDB = process.env.MONGO_URI;

//process.env.URLDB = urlDB;

export const dbUrl = urlDB;