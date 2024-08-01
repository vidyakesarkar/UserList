import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import './UserList.css';

const UserList = () => {
 // State to store the list of users
const [users, setUsers] = useState([]);

// State to keep track of the current page for pagination
const [page, setPage] = useState(0);

// State to determine if there are more users to load
const [hasMore, setHasMore] = useState(true);

// State to manage the field by which users are sorted (default is 'id')
const [sortField, setSortField] = useState('id');

// State to manage the sort order (ascending or descending)
const [sortOrder, setSortOrder] = useState('asc');

// State to handle filtering criteria for gender and country
const [filters, setFilters] = useState({
  gender: '', 
  country: '' 
});


  // This effect runs when either 'page' or 'filters' changes
// It triggers the 'fetchUsers' function to load or reload users
useEffect(() => {
    fetchUsers();
  }, [page, filters]); // Dependencies: page and filters
  
  // This effect runs when either 'sortField' or 'sortOrder' changes
  // It triggers the 'sortUsers' function to sort the users based on the selected field and order
  useEffect(() => {
    sortUsers();
  }, [sortField, sortOrder]); // Dependencies: sortField and sortOrder
  
  
  const fetchUsers = async () => {
    try {
        // Make a request to the server to get users
        const response = await axios.get('https://dummyjson.com/users', {
          params: {
            // Limit the number of users returned to 10
            limit: 10,
            // Skip users based on the current page number
            skip: page * 10,
          },
        });
    

      // Extract the list of users from the server response
let fetchedUsers = response.data.users;

      // Filter users based on the selected gender, if provided
    if (filters.gender) {
    fetchedUsers = fetchedUsers.filter(user => user.gender.toLowerCase() === filters.gender.toLowerCase());
  }
  
      // Filter users based on the selected country, if provided
     if (filters.country) {
    fetchedUsers = fetchedUsers.filter(user => user.address.country.toLowerCase().includes(filters.country.toLowerCase()));
     }

     // Update the state with the filtered users
if (page === 0) {
    // If it's the first page, replace all users with the filtered ones
    setUsers(fetchedUsers);
  } else {
    // If it's not the first page, append the new users to the existing list
    setUsers(prevUsers => [...prevUsers, ...fetchedUsers]);
  }

     // Check if there are fewer than 10 users, indicating there might be no more users to fetch
if (fetchedUsers.length < 10) {
    setHasMore(false);
  }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Function to sort the list of users
const sortUsers = () => {
    // Create a copy of the current users list to avoid modifying the original list
    const sortedUsers = [...users].sort((a, b) => {
      
      // Extract the values to be compared based on the selected sort field
      let fieldA = a[sortField];
      let fieldB = b[sortField];
  
      // Convert string values to lowercase for case-insensitive comparison
      if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
      if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();
  
      // Determine the sort order: ascending ('asc') or descending ('desc')
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      
      // Return 0 if the values are equal
      return 0;
    });
  
    // Update the state with the sorted list of users
    setUsers(sortedUsers);
  };
  

 // Function to handle sorting when a column header is clicked
const handleSort = (field) => {
    // Check if the clicked column is the one currently being sorted
    if (sortField === field) {
      // If it's the same column, toggle the sort order between ascending and descending
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If it's a different column, set the new column as the sort field
      // and default to ascending order
      setSortField(field);
      setSortOrder('asc');
    }
  };
  

  // Function to handle changes in filter inputs
const handleFilterChange = (e) => {
    // Update the filters state with the new value from the input field
   
    setFilters({ ...filters, [e.target.name]: e.target.value });
  
    // Reset the page number to 0 to fetch results from the beginning
    setPage(0);
  
    // Clear the current list of users to refresh with the filtered results
    setUsers([]);
  };
  

  // Format demography with suffix
// Function to format age and gender into a single string
const formatDemography = (age, gender) => {
    // Create a string that combines the age and a gender abbreviation
   
    return `${age}/${gender === 'male' ? 'm' : 'f'}`;
  };
  

  return (
    <div className="user-list-container">
      <h1>User List</h1>
      <div className="filters">
        <label>
          Gender:
          <select name="gender" onChange={handleFilterChange} className="filter-select">
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          Country:
          <input
            type="text"
            name="country"
            onChange={handleFilterChange}
            placeholder="Filter by country"
            className="filter-input"
          />
        </label>
      </div>
   
      <InfiniteScroll
        dataLength={users.length}
        next={() => setPage(page + 1)}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more users to display</p>}
      >
        <table className="user-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Image</th>
              <th onClick={() => handleSort('firstName')}>
                Name {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('age')}>
                Demography {sortField === 'age' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Gender</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><img src={user.image} alt={`${user.firstName} ${user.lastName}`} className="user-image" /></td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{formatDemography(user.age, user.gender)}</td>
                <td>{user.gender}</td>
                <td>{user.address.city}, {user.address.state}, {user.address.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default UserList;
