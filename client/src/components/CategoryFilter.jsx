const CategoryFilter = ({ categories, selected, onChange }) => (
  <div className="md:w-64">
    <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
      Filter by category
    </label>
    <select
      id="category-filter"
      value={selected || ''}
      onChange={(event) => onChange(event.target.value || null)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category._id} value={category.slug || category._id}>
          {category.name}
        </option>
      ))}
    </select>
  </div>
);

export default CategoryFilter;

