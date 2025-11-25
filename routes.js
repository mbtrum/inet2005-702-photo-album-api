import express from 'express';
import sql from 'mssql';
import 'dotenv/config';

const router = express.Router();

// get connection string from ennpm run vironment variable
const dbConnectionString = process.env.DB_CONNECTION_STRING;

// GET: /api/photos
router.get('/', async (req, res) => {
  
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(dbConnectionString);
    
    const result = await sql.query`SELECT a.[PhotoId], a.[Title] as PhotoTitle, a.[Description], a.[Filename], a.[CreateDate], a.[Camera], b.[CategoryId], b.[Title] as CategoryTitle
        from [dbo].[Photo] a 
        INNER JOIN [dbo].[Category] b 
        ON a.[CategoryId] = b.[CategoryId]
        ORDER BY a.[CreateDate] DESC`;

    console.log("Photos retrieved:", result.recordset.length);
    
    // return the results as json
    res.json(result.recordset);
  
});

// GET: /api/photos/1
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    if(isNaN(id)) {
        res.status(400).send('Invalid photo ID.');
        return;
    }

    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(dbConnectionString);
    
    const result = await sql.query`SELECT a.[PhotoId], a.[Title] as PhotoTitle, a.[Description], a.[Filename], a.[CreateDate], a.[Camera], b.[CategoryId], b.[Title] as CategoryTitle
        from [dbo].[Photo] a 
        INNER JOIN [dbo].[Category] b 
        ON a.[CategoryId] = b.[CategoryId]
        WHERE a.[PhotoId] = ${id}`;
    
        console.log("Photo retrieved by ID:", result.recordset.length);
    
    // return the results as json
    if(result.recordset.length === 0) {
        res.status(404).json({ message: 'Photo not found.'});        
    }
    else {
        res.json(result.recordset[0]); // only return the first row (should always be the case)
    }
});

// POST: /api/photos
router.post('/', async (req, res) => {
    const photo = req.body;

    // To-Do: validate proper JSON structure

    //
    // TO-DO: Add validation for photo object
    //

    await sql.connect(dbConnectionString);

    const result = await sql.query`INSERT INTO [dbo].[Comment] 
        (Body, Author, CreateDate, PhotoId) 
        VALUES 
        (${photo.Body}, ${photo.Author}, GETDATE(), ${photo.PhotoId})`;

    console.log("Comment added:", result.rowsAffected);
    
    res.json({ message: 'Comment added successfully.'});
});


export default router;