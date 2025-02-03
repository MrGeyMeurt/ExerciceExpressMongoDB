import express, { type Request, Response } from 'express';
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mmi";

const {
    PORT,
    MONGO_URI
} = process.env as {
    [key: string]: string
};

// Middleware
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions)
.then(() => console.log("MongoDB connecté"))
.catch(err => console.error("Erreur de connexion à MongoDB:", err));

// Modèle Mongoose
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    addProps: Boolean
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

// Routes CRUD

// Créer un item
app.put("/items", async (req: Request, res: Response) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ error: ( error as Error).message });
    }
});

// Lire tous les items
app.get("/items", async (req: Request, res: Response) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: ( error as Error).message });
    }
});

// Lire un item
app.get("/items/:id", async (req, res) => {
    try {
        const document = await Item.findById(req.params.id);
        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ error: ( error as Error).message });
    }
});

// Lire un item dont le prix est entre 20 et 30 euros
app.post("/items/price-range", async (req: Request, res: Response) => {
    const { min, max } = req.body;
    try {
        const items = await Item.find({ price: { $gte: min, $lte: max } });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Lire un item dont le prix est entre 20 et 30 euros et trié par prix décroissant
app.post("/items/price-range-sort", async (req, res) => {
    const { min, max } = req.body;
    try {
        const items = await Item.find({ price: { $gte: min, $lte: max } }).sort({ price: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: ( error as Error).message });
    }
});

// Mettre à jour un item
app.get("/items/:id", async (req, res) => {
    try {
        const document = await Item.findById(req.params.id);
        res.status(200).json(document);
    } catch (error) {
        res.status(404).json({ error: ( error as Error).message });
    }
});

// Mettre à jour un item
app.put("/items/:id", async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) res.status(404).json({ error: "Item non trouvé" });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: ( error as Error).message });
    }
});

// Supprimer un item
app.delete("/items/:id", async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) res.status(404).json({ error: "Item non trouvé" });
        res.status(200).json({ message: "Item supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: ( error as Error).message });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
