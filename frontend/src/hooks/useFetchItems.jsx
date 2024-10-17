import { useEffect, useState } from "react";
import { useSnackBars } from "./useSnackbars";
import { useToken } from "./useToken";

/**
 * Custom hook for fetching items from an API based on filter criteria and pagination.
 * @param {string} baseUrl The base URL of the API endpoint for fetching items.
 * @returns {{
 *   items: Array,       // Array of items fetched from the API.
 *   loading: boolean,   // Indicates if data is currently being fetched.
 *   filter: Object,     // Current filter criteria for fetching items.
 *   setFilter: Function,// Function to update filter criteria.
 *   pagination: Object, // Pagination information (current page, total items, etc.).
 *   setPagination: Function // Function to update pagination information.
 * }}
 */
const useFetchItems = (baseUrl) => {
  const { token } = useToken(); // Retrieves authentication token using custom hook useToken.
  const { addAlert } = useSnackBars(); // Retrieves alert function using custom hook useSnackBars.
  const [loading, setLoading] = useState(true); // State to track loading state of data fetching.
  const [options,setOptions] = useState({});  
  // State to manage filter criteria for fetching items.
  const [filter, setFilter] = useState({
    query: "",
    shape: "",
    culture: "",
    tags: [],
  });

  // State to manage pagination information for fetched items.
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    perPage: 0,
    totalPages: 0,
  });

  // State to store fetched items from the API.
  const [items, setItems] = useState([]);

  // Reset the current page when the filter changes
  useEffect(() => {
    setPagination({ ...pagination, currentPage: 1 });
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data from the API
  useEffect(() => {
    // Use setTimeout as debounce to avoid making a request on every keystroke
    const timeoutId = setTimeout(() => {
      let url = new URL(baseUrl, window.location.origin);
      let params = {
        query: filter.query,
        shape: filter.shape,
        culture: filter.culture,
        tags: filter.tags.join(","),
        page: pagination.currentPage,
      };
      Object.keys(params).forEach(
        (key) => params[key] && url.searchParams.append(key, params[key])
      );
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          const {
            current_page: currentPage,
            per_page: perPage,
            total_pages: totalPages,
            total,
            data,
            filters 
          } = response;
          setPagination({ currentPage, total, perPage, totalPages });
          setItems(data);
          setOptions(filters);
        })
        .catch((error) => {
          addAlert(error.message);
        })
        .finally(() => setLoading(false));
    }, 500); // delay of 500ms

    return () => clearTimeout(timeoutId); // cleanup on unmount or filter change
  }, [filter, pagination.currentPage, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Return objects and functions for external use.
  return {
    items,
    loading,
    filter,
    setFilter,
    pagination,
    setPagination,
    options
  };
};

export default useFetchItems;
