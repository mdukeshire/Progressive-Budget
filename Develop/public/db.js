const indexedDB = window.indexedDB

let db;

const request = indexedDB.open("transaction", 1);
request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("BudgetStore", { autoIncrement: true });
}

request.onsuccess = ({target}) => {
    db = target.result;
    if(navigator.onLine) {
        checkDB();
    }
}

const saveRecord = (record) => {
    console.log('Save record invoked');
    const transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    store.add(record);
  };

function checkDB() {
    const transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    if (res.length !== 0) {
                        const transaction = db.transaction(['BudgetStore'], 'readwrite');
                        const currentStore = transaction.objectStore('BudgetStore');
                        currentStore.clear();
                        console.log('Clearing store 🧹');
                    }
                });
        }
    };
}

window.addEventListener('online', checkDB);