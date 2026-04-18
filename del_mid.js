const fs = require('fs');
if (fs.existsSync('src/middleware.ts')) {
   fs.unlinkSync('src/middleware.ts');
   console.log('Deleted middleware.ts');
}
