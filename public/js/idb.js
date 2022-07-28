// variable to hold the connection
let db;

// connection to IndexedDB
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
// stores budget added while offline
db.createObjectStore('new_transaction', { keyPath: "myKey" });

//when online again upload 
request.onsuccess = function(event) {
    db = event.target.result;

if(navigator.onLine) {
    uploadTransaction();
}
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};
}

// a function to save the submitted info when there is no internet connection
function saveRecord(record){
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(record);
};

function uploadTransaction() {
    // open db and access object store
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');

    //get all record and save to a variable
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: { 
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_transaction');

                transactionObjectStore.clear();

                alert('All transactions have been submitted!');

            })
            .catch(err => {
                console.log(err);
            });
        }
    };

};

window.addEventListener('online', uploadTransaction);
