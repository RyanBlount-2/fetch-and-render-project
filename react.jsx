function App() {
   // These lines use destructuring. useState(), useEffect(), & useReducer are functions of React. This eliminates the need to write React before each of them.
   let {Fragment, useState, useEffect, useReducer} = React;
   let [query, setQuery] = useState('');
   let [currentPage, setCurrentPage] = useState(1);
   let [pageSize, setPageSize] = useState(10);
   // Custom Hook.
   let [{data, isLoading, isError}, doFetch] = useDataApi(
      'https://hn.algolia.com/api/v1/search?query=MIT',
      {
         hits: [],
      }
   );
   // Changes the page number depending on what button the user clicks.
   let handlePageChange = (e) => {
      setCurrentPage(Number(e.target.textContent));
   };

   // Changes the page number depending on what button the user clicks.
   let handlePageSizeChange = (e) => {
      setPageSize(Number(e.target.value));
   };

   let page = data.hits;
   if (page.length >= 1) {
      page = paginate(page, pageSize, currentPage);
      console.log(`currentPage: ${currentPage}`);
   }
   return (
      <Fragment>
         <form onSubmit={(e) => {
            setUrl(`http://hn.algolia.com/api/v1/search?query=${query}`);
            e.preventDefault();
         }}>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}></input>
            <button type="submit">Search</button>
         </form>
         <SelectPageSize onChange={handlePageSizeChange}></SelectPageSize>
         {isError && <div>Something went wrong...</div>}
         {isLoading ? (
            <div>Loading ...</div>
         ) : (
            // Part 1, step 2 code goes here
            <ul className="list-group">
               {page.map((item) => (
                  <li className="list-group-item" key={item.objectID}>
                     <a href={item.url}>{item.title}</a>
                  </li>
               ))}
            </ul>
         )}
         <Pagination items={data.hits} pageSize={pageSize} changePage={handlePageChange}></Pagination>
      </Fragment>
   );
};

// This section creates the page navigation buttons based on the number of page items and the size of the page.
let Pagination = ({items, pageSize, changePage}) => {
   // Add Bootstrap styling to the Button Component.
   let {Button} = ReactBootstrap;
   // If there is only one item, return.
   if (items.length <= 1) return null;
   // If the page holds all the items, return.
   if (pageSize >= items.length) return null;
   // Calculate the number of pages depending on the number of items. Round up to account for the last page potentially not being full.
   let numberOfPages = Math.ceil(items.length / pageSize);
   // Define the range of pages as 1 to the calculated number of pages.
   let pages = range(1, numberOfPages);
   // Create the buttons to navigate to different pages and store them in the variable pageButtons.
   let pageButtons = pages.map((element, index, array) => {
      return (
         <Button className="page-item" key={element} onClick={changePage}>{element}</Button>
      );
   });
   // Display the buttons on the page.
   return (
      <nav>
         <ul className="page-buttons">{pageButtons}</ul>
      </nav>
   );
};

// This section creates the option to change the page size.
let SelectPageSize = ({onChange}) => {
   return (
      <form>
         <label>Results Per Page:</label>
         <select onChange={onChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
         </select>
      </form>
   );
};

// This section calculates the range of pages by creating an array, defaulting the values to 0, and redefining the pages based on their index from the start.
let range = (start, end) => {
   return Array(end - start + 1)
   .fill(0)
   .map((element, index, array) => start + index);
};

// This section identifies which page items to display based on the page size and what page the user is on.
function paginate(items, pageSize, pageNumber) {
   const start = (pageNumber - 1) * pageSize;
   let page = items.slice(start, start + pageSize);
   return page;
};

let useDataApi = (initialUrl, initialData) => {
   const {useState, useEffect, useReducer} = React;
   const [url, setUrl] = useState(initialUrl);

   const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
   });

   useEffect(() => {
      let didCancel = false;
      let fetchData = async () => {
         dispatch({ type: "FETCH_INIT" });
         try {
            let result = await axios(url);
            if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
            }
         } catch (error) {
            if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
            }
         }
      };
      fetchData();
      return () => {
         didCancel = true;
      };
   }, [url]);
   return [state, setUrl];
};

let dataFetchReducer = (state, action) => {
   switch (action.type) {
   case 'FETCH_INIT':
      return {
         ...state,
         isLoading: true,
         isError: false,
      };
   case 'FETCH_SUCCESS':
      return {
         ...state,
         isLoading: false,
         isError: false,
         data: action.payload,
      };
   case 'FETCH_FAILURE':
      return {
         ...state,
         isLoading: false,
         isError: true,
      };
   default:
      throw new Error();
   }
};

let root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
