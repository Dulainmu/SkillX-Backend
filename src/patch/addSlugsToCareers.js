const mongoose = require('mongoose');
const CareerRole = require('../models/CareerRole');
require('dotenv').config();

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function patchSlugs() {
  await mongoose.connect(process.env.MONGO_URI);
  const careers = await CareerRole.find({});
  for (const career of careers) {
    const slug = slugify(career.name || '');
    if (!career.slug || career.slug !== slug) {
      career.slug = slug;
      await career.save();
      console.log(`Updated: ${career.name} -> ${slug}`);
    }
  }
  await mongoose.disconnect();
  console.log('All career roles patched with slugs!');
}

patchSlugs();
