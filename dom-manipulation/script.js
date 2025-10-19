const serverURL = 'https://jsonplaceholder.typicode.com/posts';

let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const exportBtn = document.getElementById('exportQuotes');
const syncBtn = document.getElementById('syncNow');
const categoryFilter = document.getElementById('categoryFilter');

function showRandomQuote() {
  const filtered = getFilteredQuotes();
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  if (quote) {
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>(${quote.category})</small>`;
  } else {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
  }
}

function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.placeholder = 'Enter a new quote';
  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.addEventListener('click', addQuote);
  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);
  document.body.appendChild(formDiv);
}

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  if (textInput.value && categoryInput.value) {
    const newQuote = {
      text: textInput.value,
      category: categoryInput.value
    };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    syncQuotes();
    textInput.value = '';
    categoryInput.value = '';
    alert('Quote added successfully!');
  } else {
    alert('Please enter both a quote and a category.');
  }
}

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  if (selectedCategory === 'all') return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function filterQuotes() {
  showRandomQuote();
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverURL);
    const serverData = await response.json();
    const serverQuotes = serverData.slice(0, 3).map(item => ({
      text: item.title,
      category: "Server"
    }));
    let updated = false;
    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text)) {
        quotes.push(sq);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      notifyUser('Quotes updated from server!');
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
  }
}

async function syncQuotes() {
  await fetchQuotesFromServer();
  try {
    await fetch(serverURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });
    notifyUser("Quotes synced with server!");
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

function notifyUser(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.background = '#cce5ff';
  notification.style.padding = '10px';
  notification.style.marginTop = '10px';
  notification.style.borderRadius = '8px';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

newQuoteButton.addEventListener('click', showRandomQuote);
exportBtn.addEventListener('click', exportQuotes);
syncBtn.addEventListener('click', syncQuotes);

createAddQuoteForm();
populateCategories();
showRandomQuote();
setInterval(syncQuotes, 30000);
