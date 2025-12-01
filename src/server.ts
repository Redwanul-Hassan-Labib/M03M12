import express, { Request, Response } from "express";
import {Pool} from "pg"
import dotenv from "dotenv"
import path from "path"
const app = express();
const port = 5000;

// ! Params
app.use(express.json())


// ! config file 

dotenv.config({path: path.join(process.cwd(), ".env")})

//? Data base neon Connect
const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STRING}`
})

const initBD = async()=>{
    await pool.query(`
        CREATE  TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT false,
            due_data DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `)

        
}

initBD();




app.get("/", (req: Request, res: Response) =>{
  res.send("Hello Redwanul Hassan Labib!");
});

app.post("/users", async(req: Request, res: Response) =>{
    const {name, email, age, address, phone} = req.body;

    try {
        const result = await pool.query(`INSERT INTO users(name, email, age, address, phone) VALUES($1, $2, $3, $4, $5) RETURNING *`, 
            [name, email, age, address, phone]
        )

        // console.log(result)

        // res.send({message:"data sending"})

         res.status(201).json({
            Succuss: false,
            message : "data insert",
            data : result.rows[0]
        })
        
    } catch (err: any) {
        res.status(500).json({
            Succuss: false,
            message : err.message
        })
    }

//   res.status(201).json({
//     Succuss : true,
//     Message : "api is working"
//   })
});


//! all page get 
app.get("/users", async(req: Request, res: Response)=>{
    try {
        const result = await pool.query(`SELECT * FROM users`);
        res.status(200).json({
            Succuss: false,
            message : "User face successfully",
            data : result.rows
        })
        
    } catch (err:any) {
        res.status(500).json({
            Succuss: false,
            message : err.message,
            detailes: err
        })
    }
})


//! single page get
app.get("/users/:id", async(req: Request, res: Response)=>{
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);

        if (result.rows.length === 0) {
            res.status(500).json({
            Succuss: false,
            message : "data is not nai",
            
        })
        }else{
            res.status(200).json({
            Succuss: false,
            message : "User face successfully",
            data : result.rows
        })
        }
        
    } catch (err:any) {
        res.status(500).json({
            Succuss: false,
            message : err.message,
            detailes: err
        })
    }
})

//! data put

app.put("/users/:id", async(req: Request, res: Response)=>{
    const {name, email, age, address, phone} = req.body;
    try {
        const result = await pool.query(`UPDATE users SET name=$1, email=$2, age=$3, address=$4, phone=$5 WHERE id=$6   RETURNING *` , [name, email, age, address, phone, req.params.id]);

        if (result.rows.length === 0) {
            res.status(500).json({
            Succuss: false,
            message : "data is not nai",
            
        })
        }else{
            res.status(200).json({
            Succuss: false,
            message : "User updated successfully",
            data : result.rows[0],
        })
        }
        
    } catch (err:any) {
        res.status(500).json({
            Succuss: false,
            message : err.message,
            detailes: err
        })
    }
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
