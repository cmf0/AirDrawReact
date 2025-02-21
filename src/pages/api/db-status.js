import pool from "../../lib/db";
import { allowCors } from "../../lib/cors";

// Valida se o metodo que stá a ser chamado é o correto : "GET"
async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Executa um SELECT 1 à base de dados para analisar se está "ALIVE"
    try{
        const [result] = await pool.query("SELECT 1");
        return res.status(200).json({ status: "online", message: "Database is online" });
    } catch (error) {
        console.error("Error when trying to connect to the Database:", error);
        return res.status(500).json({ status: "offline", message: "Error when trying to connect to the Database" });
    }
}

// Ensures the CORS policy is applied to the handler function
export default allowCors(handler);