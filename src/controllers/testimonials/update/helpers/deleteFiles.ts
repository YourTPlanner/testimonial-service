import fs from 'fs/promises';

export async function deleteFiles(files: Express.Multer.File[]) {
    try {
        files.forEach(async (file) => {
            const filePath = file.path;
            await fs.unlink(filePath);
        })   
    }
    catch (error) {
        console.log(error);    
    }
}