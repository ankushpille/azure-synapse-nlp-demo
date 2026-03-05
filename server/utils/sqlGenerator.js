/**
 * SQL query generation utility
 * Provides reusable SQL query strings to avoid repetition in the codebase
 */

/**
 * SQL queries for sales data analysis
 */
const SQL_QUERIES = {
  TOTAL_SALES: "SELECT SUM(amount) AS total_sales FROM dbo.sales_ext;",
  SALES_BY_REGION:
    "SELECT region, SUM(amount) AS total_sales FROM dbo.sales_ext GROUP BY region ORDER BY total_sales DESC;",
  TOP_5_PRODUCT_SALES:
    "SELECT TOP 5 product_name, SUM(amount) AS total_sales FROM dbo.sales_ext GROUP BY product_name ORDER BY total_sales DESC;",
  INDIA_SALES: "SELECT * FROM dbo.sales_ext WHERE region='India';",
  DEFAULT_QUERY: "SELECT TOP 10 * FROM dbo.sales_ext;",
};

/**
 * Get SQL query for total sales
 */
function getTotalSalesQuery() {
  return SQL_QUERIES.TOTAL_SALES;
}

/**
 * Get SQL query for sales by region
 */
function getSalesByRegionQuery() {
  return SQL_QUERIES.SALES_BY_REGION;
}

/**
 * Get SQL query for top 5 product sales
 */
function getTopProductSalesQuery() {
  return SQL_QUERIES.TOP_5_PRODUCT_SALES;
}

/**
 * Get SQL query for India sales
 */
function getIndiaSalesQuery() {
  return SQL_QUERIES.INDIA_SALES;
}

/**
 * Get default SQL query (top 10 records)
 */
function getDefaultQuery() {
  return SQL_QUERIES.DEFAULT_QUERY;
}

/**
 * Get SQL query based on type identifier
 */
function getQueryByType(type) {
  const queryMap = {
    "total-sales": getTotalSalesQuery,
    "sales-by-region": getSalesByRegionQuery,
    "top-products": getTopProductSalesQuery,
    "india-sales": getIndiaSalesQuery,
    default: getDefaultQuery,
  };

  const queryFunction = queryMap[type] || queryMap["default"];
  return queryFunction();
}

module.exports = {
  getTotalSalesQuery,
  getSalesByRegionQuery,
  getTopProductSalesQuery,
  getIndiaSalesQuery,
  getDefaultQuery,
  getQueryByType,
};
