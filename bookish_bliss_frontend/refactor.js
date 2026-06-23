const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "src");

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith(".jsx") || dirFile.endsWith(".js")) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(directoryPath);

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // 1. Remove http://localhost:5000
  content = content.replace(/http:\/\/localhost:5000/g, "");

  // 2. Remove email from query params
  // Examples:
  // `/cart/all?email=${localStorage.getItem("email")}` -> `/cart/all`
  // `?email=${localStorage.getItem("email")}` -> ``
  // `&email=${localStorage.getItem("email")}` -> ``
  content = content.replace(/\?email=\$\{localStorage\.getItem\([^)]+\)\}/g, "");
  content = content.replace(/&email=\$\{localStorage\.getItem\([^)]+\)\}/g, "");
  content = content.replace(/\?email=\$\{email\}/g, "");
  content = content.replace(/&email=\$\{email\}/g, "");

  // 3. Update localStorage.getItem("email") usage inside body
  // { ..., email: localStorage.getItem("email") } -> removed or kept? The backend doesn't need it.
  content = content.replace(/email:\s*localStorage\.getItem\([^)]+\),?\s*/g, "");

  // 4. Handle ?token=... to Headers
  // Example: `/?token=${localStorage.getItem("token")}` -> `/`
  // And we must add headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  // We'll just replace the token query parameter for now, but wait, fetch calls need the header explicitly!
  
  // It's safer to use manual edits for the auth headers, or a regex that adds the header if not present.
  
  fs.writeFileSync(file, content);
});

console.log("Replaced localhost URLs and removed email references.");
