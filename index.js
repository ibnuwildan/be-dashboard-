import express from "express"
import cors from "cors"
import session from "express-session"
import db from "./config/Database.js"
import SequelizeStore from "connect-session-sequelize"
import dotenv from "dotenv"
import UserRoute from "./routes/UserRoute.js";
import ProductRoute from "./routes/ProductRoute.js"
import AuthRoute from "./routes/AuthRoute.js"
import path from "path";

dotenv.config();


const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});


app.use('/images', express.static(path.resolve('public/images')));


// create database 
// (async () => {
//     try {
//         await db.sync(); // Sinkronisasi tabel lain seperti Users dan Products
//         console.log("Other tables synchronized successfully.");
        
//         await store.sync({ force: true }); // Menghapus dan membuat ulang tabel Sessions untuk session store
//         console.log("Session store synchronized successfully.");
//     } catch (error) {
//         console.error("Failed to synchronize database:", error);
//     }
// })();

app.use(session({
    secret:  process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}))

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.use (express.json())
app.use(UserRoute);
app.use(ProductRoute);
app.use(AuthRoute);

// store.sync();


// Jalankan server setelah database sinkron
const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, ()=> {
    console.log("server running...")
})

