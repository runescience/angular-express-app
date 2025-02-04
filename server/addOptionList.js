// addOptionList.js
const axios = require('axios');
const { stringify } = require('uuid');

const newOptionList = {
    name: 'Sample Option',
    list_data: 'Sample data',
    version: '1.0',
    supercedes: null,
    author: 'Author Name',
};

axios.post('http://0.0.0.0:3000/api/option-lists', newOptionList)
    .then(response => {
        console.log('Option List added successfully:', response.data);
    })
    .catch(error => {
        console.error('Error adding option list:', error.response ? error.response.data : error.message);
    });

/**************** 
curl -X POST http://0.0.0.0:3000/api/option-lists \
-H "Content-Type: application/json" \
-d '{
    "name": "Sample Option",
    "list_data": "Sample data",
    "version": "1.0",
    "supercedes": null,
    "author": "Author Name"
}'

 
 */

create a shell script to add a ptionlist record using this curl statement
curl -X POST http://0.0.0.0:3000/api/option-lists \
-H "Content-Type: application/json" \
-d '{
    "name": "listnamexxx",
    "list_data": "csvdata",
    "version": "xxxversion",
    "supercedes": "xxxsupercedes",
    "author": "xxxauthname"
}'
Instead of listnamexxx, csvdata, xxxversion, xxxsupercedes,xxxauthname  

use a script parameter. csvdata is comma separated values and is long string
