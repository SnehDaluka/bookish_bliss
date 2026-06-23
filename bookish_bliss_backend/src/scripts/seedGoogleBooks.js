const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../db/conn");
const ApiBook = require("../models/apiBooks");

const CATEGORIES = [
  "Fiction", "Romance", "Thriller", "Programming", "Business", 
  "History", "Science", "Biography", "Fantasy", "Mystery", 
  "Philosophy", "Art", "Music", "Cooking"
];
const MAX_RESULTS = 100;

const seedOpenLibraryBooks = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    let totalImported = 0;

    // 2. Fetch books for each category
    for (const category of CATEGORIES) {
      console.log(`\nFetching ${category} books from OpenLibrary API...`);
      const url = `https://openlibrary.org/search.json?subject=${category.toLowerCase()}&limit=${MAX_RESULTS}`;
      
      let data;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        data = await response.json();
      } catch (fetchError) {
        console.error(`Failed to fetch ${category}:`, fetchError.message);
        continue;
      }

      if (!data || !data.docs || data.docs.length === 0) {
        console.log(`No items found for category: ${category}`);
        if (data && data.error) console.log("API Error:", data.error.message);
        continue;
      }

      let categoryCount = 0;

      // 3. Process and map each book
      for (const doc of data.docs) {
        // Skip books that are missing essential data
        if (!doc.title || !doc.cover_i) {
          continue;
        }

        const apiId = doc.key; // Example: /works/OL1234567W
        
        // Check if book already exists to avoid duplicates
        const existingBook = await ApiBook.findOne({ name: doc.title.toLowerCase() });
        if (existingBook) {
          if (!existingBook.category.includes(category)) {
            existingBook.category.push(category);
            await existingBook.save();
            // console.log(`Added category ${category} to existing book: ${doc.title}`);
          } else {
            // console.log(`Skipped duplicate book title in same category: ${doc.title}`);
          }
          continue;
        }
        // Generate random selling price between 200 and 800
        const randomPrice = Math.floor(Math.random() * 600) + 200;
        
        // Make the MRP (pprice) randomly between 150 to 400 Rs HIGHER than the Selling Price
        const markup = Math.floor(Math.random() * 250) + 150;

        const newBook = new ApiBook({
          apiId: apiId,
          name: doc.title.toLowerCase(),
          category: [category],
          qty: Math.floor(Math.random() * 90) + 10,
          author: doc.author_name ? doc.author_name.join(", ") : "Unknown Author",
          publisher: doc.publisher ? doc.publisher[0] : "Independent Publisher",
          pprice: randomPrice + markup, // MRP is higher than Selling Price
          sprice: randomPrice,
          authordetails: `${doc.author_name ? doc.author_name.join(", ") : "This author"} is a highly acclaimed writer known for their captivating work in the ${category.toLowerCase()} genre. With a profound passion for storytelling and a unique narrative voice, their books continue to resonate with readers around the world.`,
          description: doc.description ? (typeof doc.description === 'string' ? doc.description : doc.description.value) : (doc.first_sentence ? doc.first_sentence[0] : `A fascinating book about ${category}. Dive into the incredible world created by ${doc.author_name ? doc.author_name[0] : "this author"} and discover why this book is a must-read for fans of the genre!`), 
          imgsrc: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
          rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : (Math.random() * 2 + 3).toFixed(1), // OpenLibrary sometimes provides ratings, otherwise random 3.0-5.0
          discount: 0,
          subtitle: doc.subtitle || "",
          pageCount: doc.number_of_pages_median || Math.floor(Math.random() * 500) + 200,
          publicationDate: doc.first_publish_year ? doc.first_publish_year.toString() : (Math.floor(Math.random() * (2024 - 1980)) + 1980).toString(),
          isbn10: doc.isbn ? doc.isbn.find(i => i.length === 10) || Array(10).fill(0).map(()=>Math.floor(Math.random()*10)).join('') : Array(10).fill(0).map(()=>Math.floor(Math.random()*10)).join(''),
          isbn13: doc.isbn ? doc.isbn.find(i => i.length === 13) || Array(13).fill(0).map(()=>Math.floor(Math.random()*10)).join('') : Array(13).fill(0).map(()=>Math.floor(Math.random()*10)).join(''),
          language: doc.language ? doc.language[0] : "en",
        });

        try {
          await newBook.save();
          categoryCount++;
          totalImported++;
        } catch (saveError) {
          if (saveError.code === 11000) {
            console.log(`Skipped duplicate book title: ${doc.title}`);
          } else {
            console.error(`Error saving book ${doc.title}:`, saveError);
          }
        }
      }

      console.log(`Successfully imported ${categoryCount} new books for ${category}.`);
      
      // Sleep for 2 seconds to avoid rate limiting / timeouts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n🎉 SEEDING COMPLETE! Total new books imported: ${totalImported}`);

  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    process.exit(0);
  }
};

seedOpenLibraryBooks();
