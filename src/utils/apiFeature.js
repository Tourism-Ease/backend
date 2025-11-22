/**
 * APIFeature class to handle filtering, sorting, field limiting, search, and pagination
 * for Mongoose queries based on request query parameters.
 */
class APIFeature {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this._filter = {};
    this._search = {};
    this.paginationResult = {};
  }

  // 1) Filtering

  // Apply filtering using (gte, gt, lte, lt)
  // /products?averageRating[lt]=4&price[gte]=100
  // { price: {$gte: 50}, averageRating: {$gte: 4} }
  filter() {
    const queryStringObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'keyword'];
    excludedFields.forEach((field) => delete queryStringObj[field]);

    // If using `filter[city]` style
    let filterQuery = {};

    if (queryStringObj.filter) {
      for (const key in queryStringObj.filter) {
        // If the key is meant for nested 'address', prefix it
        if (['city', 'country', 'street'].includes(key)) {
          filterQuery[`address.${key}`] = queryStringObj.filter[key];
        } else {
          filterQuery[key] = queryStringObj.filter[key]; // top-level fields
        }
      }
    }

    // Support MongoDB operators (gte, lte, etc.)
    let queryStr = JSON.stringify(filterQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    filterQuery = JSON.parse(queryStr);

    this.mongooseQuery = this.mongooseQuery.find(filterQuery);
    this._filter = filterQuery;

    return this;
  }

  // 2) Sorting

  // { sort: "price", sort: "-price", sort: "price - averageRating" }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.collation({ locale: 'en', strength: 2 }).sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  // 3) Field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery.select('-__v');
    }
    return this;
  }

  // 4) Search
  search(modelName) {
    if (this.queryString.keyword) {
      let searchQuery = {};

      switch (modelName) {
        case 'Destination':
          searchQuery = {
            $or: [
              { name: { $regex: this.queryString.keyword, $options: 'i' } },
              { country: { $regex: this.queryString.keyword, $options: 'i' } },
              { city: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;
        case 'Transportation':
          searchQuery = {
            $or: [
              { companyName: { $regex: this.queryString.keyword, $options: 'i' } },
              { type: { $regex: this.queryString.keyword, $options: 'i' } },
              { class: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;
        case 'Hotel':
          searchQuery = {
            $or: [
              { name: { $regex: this.queryString.keyword, $options: 'i' } },
              { 'address.city': { $regex: this.queryString.keyword, $options: 'i' } },
              { 'address.country': { $regex: this.queryString.keyword, $options: 'i' } },
              { propertyHighlights: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;
        case 'Trip':
          searchQuery = {
            $or: [
              { name: { $regex: this.queryString.keyword, $options: 'i' } },
              { 'title': { $regex: this.queryString.keyword, $options: 'i' } },
              { 'overview': { $regex: this.queryString.keyword, $options: 'i' } },
              { propertyHighlights: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;

        case 'RoomType':
          searchQuery = {
            $or: [
              { name: { $regex: this.queryString.keyword, $options: 'i' } },
              { amenities: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;

        case 'User':
          searchQuery = {
            $or: [
              { firstName: { $regex: this.queryString.keyword, $options: 'i' } },
              { lastName: { $regex: this.queryString.keyword, $options: 'i' } },
              { email: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;
        case 'Booking':
          searchQuery = {
            $or: [
              { bookingNumber: { $regex: this.queryString.keyword, $options: 'i' } },
            ],
          };
          break;
        default:
          searchQuery = {
            $or: [{ name: { $regex: this.queryString.keyword, $options: 'i' } }],
          };
      }

      this.mongooseQuery = this.mongooseQuery.find(searchQuery);
      this._search = searchQuery;
    }
    return this;
  }

  // 5) Pagination
  paginate(totalDocs) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 50;
    const skip = (page - 1) * limit;
    const numberOfPages = Math.ceil(totalDocs / limit);

    this.paginationResult = {
      currentPage: page,
      limit,
      numberOfPages,
      totalDocs,
      next: page < numberOfPages ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    };

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  // Count documents matching the filter & search
  async count() {
    const queryClone = this.mongooseQuery.clone(this._filter || {});
    if (this._search) queryClone.find(this._search);
    this.totalDocs = await queryClone.countDocuments();
  }
}

export default APIFeature;
