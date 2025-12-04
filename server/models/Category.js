const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.pre('validate', async function generateSlug(next) {
  if (!this.isModified('name') && this.slug) {
    return next();
  }

  const baseSlug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  let slugCandidate = baseSlug;
  let counter = 0;
  const CategoryModel = this.constructor;

  // eslint-disable-next-line no-await-in-loop
  while (await CategoryModel.exists({ slug: slugCandidate, _id: { $ne: this._id } })) {
    counter += 1;
    slugCandidate = `${baseSlug}-${counter}`;
  }

  this.slug = slugCandidate;
  return next();
});

module.exports = mongoose.model('Category', CategorySchema);

